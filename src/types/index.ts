/**
 * NotifyPayload defines the expected request body for /v1/notify
 */
export interface NotifyPayload {
  source: 'coach-aigent-crm' | 'devsecops';
  type: 'success' | 'info' | 'warning' | 'error' | 'critical';
  event: string;
  message: string;
  thread_name?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Bindings for Cloudflare Workers Environment Variables
 */
export interface Bindings {
  API_KEY: string;
  CHANNEL_DISCORD_COACHAIGENT_CRM_WEBHOOK: string;
  CHANNEL_DISCORD_DEVSECOPS_WEBHOOK: string;
}
