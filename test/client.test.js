const assert = require('assert');
const test = require('node:test');
const { FoxciteClient, FoxciteApiError } = require('../dist/index.js');

// Mock helper to intercept global fetch calls
function mockGlobalFetch(responseObj, status = 200, ok = true) {
  const originalFetch = global.fetch;
  let lastRequest = null;

  global.fetch = async (url, options) => {
    lastRequest = { url, options };
    return {
      ok,
      status,
      json: async () => responseObj,
      text: async () => JSON.stringify(responseObj)
    };
  };

  return {
    restore: () => {
      global.fetch = originalFetch;
    },
    getLastRequest: () => lastRequest
  };
}

test('FoxciteClient initialization and auth header configuration', async (t) => {
  await t.test('adds Bearer prefix to API keys', async () => {
    const client = new FoxciteClient({
      apiKey: 'seomd_live_abc123',
      baseUrl: 'http://mock-api'
    });

    const mock = mockGlobalFetch({ success: true });
    try {
      await client.brands.list();
      const req = mock.getLastRequest();
      assert.strictEqual(req.options.headers['Authorization'], 'Bearer seomd_live_abc123');
    } finally {
      mock.restore();
    }
  });

  await t.test('passes Authorization header as-is if already prefixed', async () => {
    const client = new FoxciteClient({
      apiKey: 'Bearer custom_jwt_token',
      baseUrl: 'http://mock-api'
    });

    const mock = mockGlobalFetch({ success: true });
    try {
      await client.brands.list();
      const req = mock.getLastRequest();
      assert.strictEqual(req.options.headers['Authorization'], 'Bearer custom_jwt_token');
    } finally {
      mock.restore();
    }
  });

  await t.test('merges extra custom headers', async () => {
    const client = new FoxciteClient({
      apiKey: 'test-key',
      baseUrl: 'http://mock-api',
      headers: { 'x-payment-token': 'pay-abc' }
    });

    const mock = mockGlobalFetch({ success: true });
    try {
      await client.brands.list();
      const req = mock.getLastRequest();
      assert.strictEqual(req.options.headers['x-payment-token'], 'pay-abc');
      assert.strictEqual(req.options.headers['Authorization'], 'Bearer test-key');
    } finally {
      mock.restore();
    }
  });
});

test('FoxciteClient resource methods map correctly', async (t) => {
  const client = new FoxciteClient({
    apiKey: 'test-key',
    baseUrl: 'http://mock-api'
  });

  await t.test('brands.create maps to POST /brands', async () => {
    const mock = mockGlobalFetch({ id: 'brand-1', name: 'Brand 1' });
    try {
      const payload = { name: 'Brand 1', domain: 'brand1.com', niche: 'Tech' };
      const res = await client.brands.create(payload);
      const req = mock.getLastRequest();

      assert.strictEqual(req.url, 'http://mock-api/brands');
      assert.strictEqual(req.options.method, 'POST');
      assert.deepStrictEqual(JSON.parse(req.options.body), payload);
      assert.strictEqual(res.name, 'Brand 1');
    } finally {
      mock.restore();
    }
  });

  await t.test('audits.quickAudit maps to POST /quick-audit', async () => {
    const mock = mockGlobalFetch({ scan_id: 'scan-123', status: 'pending' });
    try {
      const payload = { name: 'Brand 1', domain: 'brand1.com', niche: 'Tech', query: 'best database' };
      const res = await client.audits.quickAudit(payload);
      const req = mock.getLastRequest();

      assert.strictEqual(req.url, 'http://mock-api/quick-audit');
      assert.strictEqual(req.options.method, 'POST');
      assert.deepStrictEqual(JSON.parse(req.options.body), payload);
      assert.strictEqual(res.scan_id, 'scan-123');
    } finally {
      mock.restore();
    }
  });

  await t.test('queries.listTracked maps to GET /brands/:id/keywords', async () => {
    const mock = mockGlobalFetch([{ query: 'best database', volume: 1000 }]);
    try {
      const res = await client.queries.listTracked('brand-123');
      const req = mock.getLastRequest();

      assert.strictEqual(req.url, 'http://mock-api/brands/brand-123/keywords');
      assert.strictEqual(req.options.method, 'GET');
      assert.strictEqual(res[0].query, 'best database');
    } finally {
      mock.restore();
    }
  });
});

test('FoxciteClient error handling', async (t) => {
  const client = new FoxciteClient({
    apiKey: 'test-key',
    baseUrl: 'http://mock-api'
  });

  await t.test('throws FoxciteApiError on non-2xx status', async () => {
    const mock = mockGlobalFetch({ message: 'Credits depleted' }, 402, false);
    try {
      await assert.rejects(
        async () => {
          await client.brands.list();
        },
        (err) => {
          assert.ok(err instanceof FoxciteApiError);
          assert.strictEqual(err.status, 402);
          assert.match(err.message, /Credits depleted/);
          return true;
        }
      );
    } finally {
      mock.restore();
    }
  });
});
