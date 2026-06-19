# Foxcite TypeScript / JavaScript SDK

[![npm version](https://badge.fury.io/js/@foxcite%2Fsdk.svg)](https://badge.fury.io/js/@foxcite%2Fsdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

The official TypeScript client library for the [Foxcite](https://foxcite.com) API. Foxcite is an [ai search visibility tracker](https://foxcite.com) and AEO monitoring platform that helps track your brand's presence across ChatGPT, Claude, Gemini, Grok, and Perplexity.

## Features
- **TypeScript First:** 100% strongly typed interfaces and return types.
- **Isomorphic:** Works in Node.js, Edge Runtimes (Cloudflare Workers, Vercel Edge), and modern browsers via the native `fetch` API.
- **Zero Dependencies:** Keeps your bundle size incredibly small.

## Installation

```bash
npm install @foxcite/sdk
# or
yarn add @foxcite/sdk
# or
pnpm add @foxcite/sdk
```

## Quick Start

You can generate an API Key from your [Foxcite Dashboard](https://foxcite.com).

```typescript
import { FoxciteClient } from '@foxcite/sdk';

const client = new FoxciteClient({ 
  apiKey: 'seomd_live_...' 
});

async function run() {
  // 1. List your brands
  const brands = await client.brands.list();
  console.log('My Brands:', brands);

  // 2. Run an AI Visibility Audit
  const audit = await client.audits.quickAudit({
    name: 'Foxcite',
    domain: 'foxcite.com',
    niche: 'AEO Tools',
    query: 'best AI visibility monitoring software'
  });
  console.log('Audit generated:', audit.id);
}

run();
```

## Developer Notes & Error Handling
The SDK throws a custom `FoxciteApiError` when the API returns a non-2xx status code. This error object contains the exact HTTP status code and the parsed error message from the backend, making it easy to handle rate limits or validation errors gracefully.

## Contributing
1. Clone the repository.
2. Install dependencies: `npm install`
3. Build the SDK: `npm run build`
4. Run tests: `npm test`

## Resources
- [Homepage](https://foxcite.com)
- [Bug Tracker](https://github.com/foxciteai/sdk-js/issues)
