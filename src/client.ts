import * as types from './types';

export interface FoxciteConfig {
  apiKey?: string;     // Can be a "seomd_live_..." key or Supabase JWT token
  authToken?: string;  // Explicit Supabase JWT token override
  baseUrl?: string;    // Defaults to production URL
  headers?: Record<string, string>; // Extra headers (like x-payment-token or SIGN-IN-WITH-X)
}

export interface RequestOptions {
  headers?: Record<string, string>;
}

export class FoxciteClient {
  private apiKey?: string;
  private authToken?: string;
  private baseUrl: string;
  private extraHeaders: Record<string, string>;

  public brands: BrandsResource;
  public competitors: CompetitorsResource;
  public audits: AuditsResource;
  public playbooks: PlaybooksResource;
  public queries: QueriesResource;
  public agents: AgentsResource;
  public billing: BillingResource;
  public cli: CliResource;

  constructor(config: FoxciteConfig = {}) {
    this.apiKey = config.apiKey;
    this.authToken = config.authToken;
    this.baseUrl = config.baseUrl || 'https://api.foxcite.com';
    this.extraHeaders = config.headers || {};

    this.brands = new BrandsResource(this);
    this.competitors = new CompetitorsResource(this);
    this.audits = new AuditsResource(this);
    this.playbooks = new PlaybooksResource(this);
    this.queries = new QueriesResource(this);
    this.agents = new AgentsResource(this);
    this.billing = new BillingResource(this);
    this.cli = new CliResource(this);
  }

  public async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    path: string,
    body?: any,
    options: RequestOptions = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.extraHeaders,
      ...options.headers,
    };

    const auth = this.authToken || this.apiKey;
    if (auth) {
      // In the backend, verify_cli_user accepts Authorization: Bearer seomd_live_...
      // or Authorization: Bearer <supabase_jwt>
      headers['Authorization'] = auth.startsWith('Bearer ') ? auth : `Bearer ${auth}`;
    }

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      let errorBody: any;
      try {
        errorBody = await response.json();
      } catch {
        errorBody = await response.text();
      }
      throw new FoxciteApiError(response.status, errorBody);
    }

    return response.json() as Promise<T>;
  }
}

export class FoxciteApiError extends Error {
  constructor(public status: number, public body: any) {
    super(`Foxcite API Error [${status}]: ${typeof body === 'object' ? JSON.stringify(body) : body}`);
    this.name = 'FoxciteApiError';
  }
}

class BrandsResource {
  constructor(private client: FoxciteClient) {}

  public async list(options?: RequestOptions): Promise<types.Brand[]> {
    return this.client.request<types.Brand[]>('GET', '/brands', undefined, options);
  }

  public async create(
    brand: { name: string; domain: string; niche: string },
    options?: RequestOptions
  ): Promise<types.Brand> {
    return this.client.request<types.Brand>('POST', '/brands', brand, options);
  }

  public async get(brandId: string, options?: RequestOptions): Promise<types.Brand> {
    return this.client.request<types.Brand>('GET', `/brands/${brandId}`, undefined, options);
  }

  public async update(
    brandId: string,
    update: { agent_automation_enabled?: boolean; name?: string; domain?: string; niche?: string },
    options?: RequestOptions
  ): Promise<types.Brand> {
    return this.client.request<types.Brand>('PATCH', `/brands/${brandId}`, update, options);
  }

  public async delete(brandId: string, options?: RequestOptions): Promise<{ status: string }> {
    return this.client.request<{ status: string }>('DELETE', `/brands/${brandId}`, undefined, options);
  }

  public async getSettings(brandId: string, options?: RequestOptions): Promise<types.Brand> {
    // PUT /brands/{brand_id}/settings also updates them. GET GSC properties is related.
    // Let's allow putting new settings
    return this.client.request<types.Brand>('GET', `/brands/${brandId}`, undefined, options);
  }

  public async updateSettings(
    brandId: string,
    settings: {
      weekly_scan_enabled: boolean;
      daily_scan_enabled?: boolean;
      target_llms: string;
      gsc_property?: string;
      gsc_verified?: boolean;
    },
    options?: RequestOptions
  ): Promise<types.Brand> {
    return this.client.request<types.Brand>('PUT', `/brands/${brandId}/settings`, settings, options);
  }

  public async getGscProperties(brandId: string, options?: RequestOptions): Promise<{ properties: string[] }> {
    return this.client.request<{ properties: string[] }>('GET', `/brands/${brandId}/gsc/properties`, undefined, options);
  }

  public async verifyGscProperty(
    brandId: string,
    propertyUrl: string,
    options?: RequestOptions
  ): Promise<types.Brand> {
    return this.client.request<types.Brand>('POST', `/brands/${brandId}/gsc/verify`, { property_url: propertyUrl }, options);
  }

  public async disconnectGsc(brandId: string, options?: RequestOptions): Promise<types.Brand> {
    return this.client.request<types.Brand>('DELETE', `/brands/${brandId}/gsc/disconnect`, undefined, options);
  }

  public async getGscAnalytics(brandId: string, options?: RequestOptions): Promise<any> {
    return this.client.request<any>('GET', `/brands/${brandId}/gsc/analytics`, undefined, options);
  }

  public async getDashboard(brandId: string, options?: RequestOptions): Promise<any> {
    return this.client.request<any>('GET', `/brands/${brandId}/dashboard`, undefined, options);
  }
}

class CompetitorsResource {
  constructor(private client: FoxciteClient) {}

  public async list(brandId: string, options?: RequestOptions): Promise<types.CompetitorsResponse> {
    return this.client.request<types.CompetitorsResponse>('GET', `/brands/${brandId}/competitors`, undefined, options);
  }

  public async add(
    brandId: string,
    competitor: { name: string; domain: string },
    options?: RequestOptions
  ): Promise<types.Competitor> {
    return this.client.request<types.Competitor>('POST', `/brands/${brandId}/competitors`, competitor, options);
  }

  public async ignore(brandId: string, competitorId: string, options?: RequestOptions): Promise<{ status: string; message: string }> {
    return this.client.request<{ status: string; message: string }>(
      'PATCH',
      `/brands/${brandId}/competitors/${competitorId}/ignore`,
      undefined,
      options
    );
  }

  public async getMentions(brandId: string, competitorId: string, options?: RequestOptions): Promise<any[]> {
    return this.client.request<any[]>('GET', `/brands/${brandId}/competitors/${competitorId}/mentions`, undefined, options);
  }

  public async getSourceDossiers(brandId: string, competitorId: string, options?: RequestOptions): Promise<any[]> {
    return this.client.request<any[]>('GET', `/brands/${brandId}/competitors/${competitorId}/source-dossiers`, undefined, options);
  }
}

class AuditsResource {
  constructor(private client: FoxciteClient) {}

  public async quickAudit(
    audit: { name: string; domain: string; niche: string; engines?: string; query?: string },
    options?: RequestOptions
  ): Promise<types.QuickAuditResponse> {
    // Quick audit scan
    return this.client.request<types.QuickAuditResponse>('POST', '/quick-audit', audit, options);
  }

  public async fullAudit(
    audit: { name: string; domain: string; niche: string; engines?: string; query?: string },
    options?: RequestOptions
  ): Promise<types.QuickAuditResponse> {
    // Full audit scan (with Playbook generation)
    return this.client.request<types.QuickAuditResponse>('POST', '/full-audit', audit, options);
  }

  public async getReport(scanId: string, options?: RequestOptions): Promise<types.ReportDetailResponse> {
    return this.client.request<types.ReportDetailResponse>('GET', `/reports/${scanId}`, undefined, options);
  }

  public async getPublicReport(scanId: string, options?: RequestOptions): Promise<types.ReportDetailResponse> {
    return this.client.request<types.ReportDetailResponse>('GET', `/public/reports/${scanId}`, undefined, options);
  }

  public async deleteReport(scanId: string, options?: RequestOptions): Promise<{ status: string }> {
    return this.client.request<{ status: string }>('DELETE', `/reports/${scanId}`, undefined, options);
  }

  public async listReports(brandId: string, options?: RequestOptions): Promise<any[]> {
    return this.client.request<any[]>('GET', `/brands/${brandId}/reports`, undefined, options);
  }

  public async getAdjacentReports(
    brandId: string,
    currentScanId: string,
    options?: RequestOptions
  ): Promise<{ prev: string | null; next: string | null; total: number; current_index: number | null }> {
    return this.client.request<{ prev: string | null; next: string | null; total: number; current_index: number | null }>(
      'GET',
      `/brands/${brandId}/scans/adjacent?current_scan_id=${currentScanId}`,
      undefined,
      options
    );
  }

  public async estimateCost(
    query: string,
    engines: string[],
    options?: RequestOptions
  ): Promise<types.CostEstimateResponse> {
    return this.client.request<types.CostEstimateResponse>('POST', '/estimate-cost', { query, engines }, options);
  }
}

class PlaybooksResource {
  constructor(private client: FoxciteClient) {}

  public async list(brandId: string, options?: RequestOptions): Promise<types.PlaybookSummary[]> {
    return this.client.request<types.PlaybookSummary[]>('GET', `/brands/${brandId}/playbooks`, undefined, options);
  }

  public async get(brandId: string, playbookId: string, options?: RequestOptions): Promise<types.PlaybookDetailResponse> {
    return this.client.request<types.PlaybookDetailResponse>('GET', `/brands/${brandId}/playbooks/${playbookId}`, undefined, options);
  }

  public async getPublic(playbookId: string, options?: RequestOptions): Promise<types.PlaybookDetailResponse> {
    return this.client.request<types.PlaybookDetailResponse>('GET', `/public/playbooks/${playbookId}`, undefined, options);
  }

  public async createFromScan(
    brandId: string,
    params: { scan_id: string; engine: string; cited_source_id?: string },
    options?: RequestOptions
  ): Promise<types.PlaybookDetailResponse> {
    return this.client.request<types.PlaybookDetailResponse>('POST', `/brands/${brandId}/playbooks/from-scan`, params, options);
  }

  public async getPlaybooksForScan(brandId: string, scanId: string, options?: RequestOptions): Promise<any[]> {
    return this.client.request<any[]>('GET', `/brands/${brandId}/playbooks/scan/${scanId}`, undefined, options);
  }
}

class QueriesResource {
  constructor(private client: FoxciteClient) {}

  public async listTracked(brandId: string, options?: RequestOptions): Promise<any[]> {
    return this.client.request<any[]>('GET', `/brands/${brandId}/keywords`, undefined, options);
  }

  public async toggleTracking(
    brandId: string,
    params: { query: string; enabled: boolean },
    options?: RequestOptions
  ): Promise<{ daily_tracked_queries: string[]; daily_scan_enabled: boolean }> {
    return this.client.request<{ daily_tracked_queries: string[]; daily_scan_enabled: boolean }>(
      'POST',
      `/brands/${brandId}/toggle-query-tracking`,
      params,
      options
    );
  }

  public async getKeywordMetrics(
    brandId: string,
    params: { keywords: string[]; country?: string; currency?: string; dataSource?: string },
    options?: RequestOptions
  ): Promise<any> {
    return this.client.request<any>('POST', `/brands/${brandId}/keywords/data`, params, options);
  }

  public async getOpportunities(
    brandId: string,
    query: string,
    options?: RequestOptions
  ): Promise<types.OpportunitiesResponse> {
    return this.client.request<types.OpportunitiesResponse>(
      'POST',
      `/brands/${brandId}/queries/opportunities`,
      { query },
      options
    );
  }

  public async triggerClassification(brandId: string, options?: RequestOptions): Promise<{ status: string }> {
    return this.client.request<{ status: string }>('POST', `/brands/${brandId}/queries/classify`, undefined, options);
  }

  public async getSuggestions(brandId: string, options?: RequestOptions): Promise<string[]> {
    return this.client.request<string[]>('GET', `/brands/${brandId}/suggestions`, undefined, options);
  }
}

class AgentsResource {
  constructor(private client: FoxciteClient) {}

  public async getStatus(brandId: string, options?: RequestOptions): Promise<types.AgentsStatusResponse> {
    return this.client.request<types.AgentsStatusResponse>('GET', `/brands/${brandId}/agents`, undefined, options);
  }

  public async trigger(
    brandId: string,
    agentId: 'anomaly' | 'discovery' | 'recovery',
    scanId?: string,
    options?: RequestOptions
  ): Promise<{ success: boolean; agent_id: string; message: string; result: any }> {
    return this.client.request<{ success: boolean; agent_id: string; message: string; result: any }>(
      'POST',
      `/brands/${brandId}/agents/trigger`,
      { agent_id: agentId, scan_id: scanId },
      options
    );
  }

  public async deconstructCompetitor(
    brandId: string,
    citedSourceId: string,
    options?: RequestOptions
  ): Promise<{ success: boolean; playbook_id: string; message: string }> {
    return this.client.request<{ success: boolean; playbook_id: string; message: string }>(
      'POST',
      `/brands/${brandId}/agent/deconstruct`,
      { cited_source_id: citedSourceId },
      options
    );
  }

  public async chat(
    message: string,
    params?: { system_prompt?: string; model?: string; conversation_history?: any[] },
    options?: RequestOptions
  ): Promise<any> {
    return this.client.request<any>('POST', '/agent/chat', { message, ...params }, options);
  }

  public async judge(
    agentOutputs: any[],
    criteria?: string,
    context?: any,
    options?: RequestOptions
  ): Promise<any> {
    return this.client.request<any>('POST', '/agent/judge', { agent_outputs: agentOutputs, criteria, context }, options);
  }
}

class BillingResource {
  constructor(private client: FoxciteClient) {}

  public async getProfile(options?: RequestOptions): Promise<types.UserProfileResponse> {
    return this.client.request<types.UserProfileResponse>('GET', '/user/profile', undefined, options);
  }

  public async updateProfile(update: types.UserProfileUpdateInput, options?: RequestOptions): Promise<types.UserProfileResponse> {
    return this.client.request<types.UserProfileResponse>('PATCH', '/user/profile', update, options);
  }

  public async getCreditsLedger(
    params?: { limit?: number; offset?: number },
    options?: RequestOptions
  ): Promise<types.CreditLedgerResponse> {
    const query = params ? `?limit=${params.limit || 100}&offset=${params.offset || 0}` : '';
    return this.client.request<types.CreditLedgerResponse>('GET', `/user/credits/ledger${query}`, undefined, options);
  }

  public async rechargeCredits(
    recharge: { user_id: string; amount_usdc: number; payment_token?: string },
    options?: RequestOptions
  ): Promise<any> {
    return this.client.request<any>('POST', '/credits/recharge', recharge, options);
  }

  public async getPricingPlans(options?: RequestOptions): Promise<any> {
    return this.client.request<any>('GET', '/settings/pricing-plans', undefined, options);
  }

  public async getPricingSettings(options?: RequestOptions): Promise<any> {
    return this.client.request<any>('GET', '/settings/pricing', undefined, options);
  }

  public async getCheckoutUrl(planName: string, options?: RequestOptions): Promise<{ url: string }> {
    return this.client.request<{ url: string }>('POST', '/billing/checkout', { plan_name: planName }, options);
  }

  public async getRechargeCheckoutUrl(packId: string, options?: RequestOptions): Promise<{ url: string }> {
    return this.client.request<{ url: string }>('POST', '/billing/recharge-checkout', { pack_id: packId }, options);
  }

  public async getPortalUrl(options?: RequestOptions): Promise<{ url: string }> {
    return this.client.request<{ url: string }>('POST', '/billing/portal', undefined, options);
  }
}

class CliResource {
  constructor(private client: FoxciteClient) {}

  public async analyze(
    config: {
      domain: string;
      niche: string;
      brand?: string;
      queries?: Record<string, any>;
      engines?: string[];
      pages?: any[];
    },
    options?: RequestOptions
  ): Promise<any> {
    return this.client.request<any>('POST', '/cli/analyze', config, options);
  }

  public async createApiKey(name?: string, options?: RequestOptions): Promise<any> {
    return this.client.request<any>('POST', '/cli/api-keys', { name }, options);
  }

  public async listApiKeys(options?: RequestOptions): Promise<any[]> {
    return this.client.request<any[]>('GET', '/cli/api-keys', undefined, options);
  }

  public async deleteApiKey(keyId: string, options?: RequestOptions): Promise<{ status: string; message: string }> {
    return this.client.request<{ status: string; message: string }>('DELETE', `/cli/api-keys/${keyId}`, undefined, options);
  }
}
