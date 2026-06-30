const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {};

const clean = (value?: string) => (value ?? '').trim();
const trimSlash = (value: string) => value.replace(/\/+$/, '');
const ensurePath = (value: string) => value.startsWith('/') ? value : `/${value}`;

export const config = {
  apiBaseUrl: trimSlash(clean(env.VITE_API_BASE_URL) || 'https://api.diceprojects.com/api'),
  backofficePublicBaseUrl: trimSlash(clean(env.VITE_BACKOFFICE_PUBLIC_BASE_URL) || 'https://backoffice.diceprojects.com'),
  campaignKey: clean(env.VITE_MARKETING_CAMPAIGN_KEY) || 'caseflow-web',
  publicBotKey: clean(env.VITE_PUBLIC_BOT_KEY) || 'caseflow-web',
  enableMarketing: clean(env.VITE_MARKETING_CAPTURE_ENABLED || 'true') !== 'false',
  enablePublicBot: clean(env.VITE_PUBLIC_BOT_ENABLED || 'true') !== 'false',
  tenantId: clean(env.VITE_DEMO_TENANT_ID) || '33333333-3333-4333-8333-333333333333',
  templatesUrl: clean(env.VITE_CASEFLOW_TEMPLATES_URL) || 'https://api.diceprojects.com/api/v1/caseflow/document-templates',
  documentsUrl: clean(env.VITE_CASEFLOW_DOCUMENTS_URL) || 'https://api.diceprojects.com/api/v1/caseflow/documents',
  templateEngagementPath: clean(env.VITE_CASEFLOW_ENGAGEMENT_TEMPLATE_PATH) || '/public/caseflow/templates/caseflow-c0cfc069-legal-engagement-letter',
  templateDemandPath: clean(env.VITE_CASEFLOW_DEMAND_TEMPLATE_PATH) || '/public/caseflow/templates/caseflow-c0cfc069-legal-demand-letter',
  deliveryPath: clean(env.VITE_CASEFLOW_DOCUMENT_DELIVERY_PATH) || '/public/caseflow/deliveries/legal-demo-legal-exp-0299-engagement',
};

export function publicUrl(path: string) {
  return `${config.backofficePublicBaseUrl}${ensurePath(path)}`;
}

function visitorId() {
  const key = 'caseflow.marketing.visitorId.v1';
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const next = window.crypto?.randomUUID?.() ?? `v_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
  window.localStorage.setItem(key, next);
  return next;
}

function sessionId() {
  const key = 'caseflow.marketing.sessionId.v1';
  const existing = window.sessionStorage.getItem(key);
  if (existing) return existing;
  const next = window.crypto?.randomUUID?.() ?? `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
  window.sessionStorage.setItem(key, next);
  return next;
}

type TrackOptions = {
  actionCode: string;
  actionLabel?: string;
  category?: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
};

export function track(eventType: string, options: TrackOptions) {
  if (!config.enableMarketing || !config.apiBaseUrl || !config.campaignKey) return;
  const payload = {
    eventType,
    entityType: options.entityType,
    entityId: options.entityId,
    visitorId: visitorId(),
    actionCode: options.actionCode,
    actionLabel: options.actionLabel,
    category: options.category,
    channel: 'WEB',
    pageUrl: window.location.href,
    referrerUrl: document.referrer || undefined,
    metadata: JSON.stringify({ vertical: 'CaseFlow', sessionId: sessionId(), tenantId: config.tenantId, ...options.metadata }),
  };
  void fetch(`${config.apiBaseUrl}/v1/campaigns/capture/${encodeURIComponent(config.campaignKey)}/events`, {
    method: 'POST',
    credentials: 'omit',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch(() => undefined);
}

export async function askPublicBot(message: string): Promise<string | null> {
  if (!config.enablePublicBot || !config.apiBaseUrl || !config.publicBotKey) return null;
  try {
    const response = await fetch(`${config.apiBaseUrl}/v1/public-bots/${encodeURIComponent(config.publicBotKey)}/message`, {
      method: 'POST',
      credentials: 'omit',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        visitorId: visitorId(),
        sessionId: sessionId(),
        language: 'es',
        pageUrl: window.location.href,
        referrerUrl: document.referrer || undefined,
        allowAi: false,
      }),
    });
    if (!response.ok) return null;
    const json = await response.json();
    return typeof json?.answer === 'string' ? json.answer : null;
  } catch {
    return null;
  }
}
