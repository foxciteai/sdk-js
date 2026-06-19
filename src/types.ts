export interface User {
  id: string;
  email: string;
  wallet_address?: string;
  full_name?: string;
  company_name?: string;
  industry?: string;
  credits: number;
  agent_tokens: number;
  subscription_tier: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  affiliate_code?: string;
  created_at: string;
  updated_at: string;
}

export interface Brand {
  id: string;
  name: string;
  slug?: string;
  domain: string;
  niche: string;
  weekly_scan_enabled: boolean;
  daily_scan_enabled: boolean;
  daily_tracked_queries?: string; // JSON string of array
  target_llms: string;
  gsc_property?: string;
  gsc_verified: boolean;
  agent_automation_enabled: boolean;
  agent_anomaly_last_run?: string;
  agent_discovery_last_run?: string;
  agent_recovery_last_run?: string;
  user_id?: string;
}

export interface Competitor {
  id: string;
  name: string;
  domain: string;
  is_ignored: boolean;
  brand_id: string;
}

export interface CompetitorVisibility {
  id: string;
  name: string;
  domain: string;
  visibility_score: number;
  lost_queries: number;
  engine_breakdown: Record<string, number>;
  top_url?: string;
  first_seen?: string;
  last_seen?: string;
}

export interface CompetitorsResponse {
  brand_visibility: number;
  competitors: CompetitorVisibility[];
}

export interface TrackedQuery {
  id: string;
  query: string;
  brand_id: string;
  intent_type?: string;
  confidence_score: number;
  classification_reasoning?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ScanSession {
  id: string;
  brand_id: string;
  processed_payment_id?: string;
  status: string; // pending, completed, failed
  timestamp: string;
}

export interface AuditResult {
  id: string;
  scan_id?: string;
  query: string;
  engine: string;
  is_cited: boolean;
  cited_urls: string;
  response_text?: string;
  sentiment_score: number;
  input_tokens?: number;
  output_tokens?: number;
  cost?: number;
  brand_id: string;
  timestamp: string;
}

export interface CitedSource {
  id: string;
  url: string;
  title: string;
  domain: string;
  audit_id: string;
}

export interface AgentPlaybook {
  id: string;
  brand_id: string;
  competitor_id: string;
  cited_source_id: string;
  audit_id: string;
  processed_payment_id?: string;
  target_query: string;
  target_engine: string;
  status: string; // pending, completed, failed
  markdown_content?: string;
  structured_recommendations?: string; // JSON string of recommendations
  input_tokens?: number;
  output_tokens?: number;
  cost?: number;
  created_at: string;
}

export interface DiscoveryInsight {
  id: string;
  brand_id: string;
  content: string;
  created_at: string;
}

export interface AgentAlert {
  id: string;
  brand_id: string;
  agent: string;
  severity: string;
  message: string;
  created_at: string;
}

export interface CreditTransaction {
  id: string;
  user_id: string;
  processed_payment_id?: string;
  amount: number;
  action_type: string;
  description?: string;
  reference_id?: string;
  created_at: string;
}

export interface KeywordMetrics {
  id: string;
  keyword: string;
  volume: number;
  cpc: number;
  competition: number;
  trend_data?: string; // JSON string of trend points
  country: string;
  currency: string;
  data_source: string;
  opportunity_score: number;
  is_pasf_derived: boolean;
  created_at: string;
}

export interface UserProfileResponse {
  id: string;
  email: string;
  full_name?: string;
  company_name?: string;
  industry?: string;
  affiliate_code?: string;
  credits: number;
  subscription_tier: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  created_at: string;
}

export interface UserProfileUpdateInput {
  full_name?: string;
  company_name?: string;
  industry?: string;
}

export interface CreditLedgerResponse {
  transactions: CreditTransaction[];
  total: number;
  limit: number;
  offset: number;
}

export interface QuickAuditResponse {
  scan_id: string;
  brand_id: string;
  brand_slug: string;
  status: string;
}

export interface ReportDetailResponse {
  id: string;
  status: string;
  timestamp: string;
  brand_name: string;
  domain: string;
  brand_id: string;
  daily_scan_enabled: boolean;
  weekly_scan_enabled: boolean;
  target_llms: string;
  gsc_property?: string;
  gsc_verified: boolean;
  query: string;
  citationRate: number;
  results: Array<{
    engine: string;
    is_cited: boolean;
    response_text?: string;
    cited_urls: string;
    timestamp: string;
  }>;
}

export interface CostEstimateResponse {
  query: string;
  input_tokens: number;
  raw_cost: number;
  final_cost: number;
  profit_margin_bps: number;
  engine_costs: Record<string, {
    raw_cost: number;
    billed_cost: number;
    model: string;
    input_tokens: number;
    output_tokens: number;
  }>;
}

export interface OpportunityScored {
  keyword: string;
  volume: number;
  cpc: number;
  competition: number;
  opportunity_score: number;
  is_seed: boolean;
}

export interface OpportunitiesResponse {
  seed_query: string;
  seed_score: number;
  opportunities: OpportunityScored[];
  credits_deducted: number;
  remaining_credits: number;
}

export interface AgentsStatusResponse {
  brand_name: string;
  automation_enabled: boolean;
  agents: Array<{
    id: string;
    name: string;
    description: string;
    status: string;
    last_run?: string;
  }>;
  discovery_insights: Array<{
    id: string;
    content: string;
    created_at: string;
  }>;
  recent_alerts: Array<{
    id: string;
    timestamp: string;
    agent: string;
    severity: string;
    message: string;
  }>;
}

export interface PlaybookSummary {
  id: string;
  status: string;
  target_query: string;
  target_engine: string;
  created_at?: string;
  competitor?: {
    id: string;
    name: string;
    domain: string;
  };
  cited_source?: {
    id: string;
    url: string;
    title: string;
    domain: string;
  };
}

export interface PlaybookDetailResponse {
  id: string;
  status: string;
  target_query: string;
  target_engine: string;
  created_at?: string;
  markdown_content?: string;
  structured_recommendations?: string;
  recommendations: any[];
  scan_id?: string;
  competitor?: {
    id: string;
    name: string;
    domain: string;
  };
  cited_source?: {
    id: string;
    url: string;
    title: string;
    domain: string;
  };
}
