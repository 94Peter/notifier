import { Hono } from 'hono';
import { handle } from 'hono/cloudflare-pages';
import { env } from 'cloudflare:workers';
import type { NotifyPayload } from './types/index.js';
import { NotificationFactory } from './factories/NotificationFactory.js';

/**
 * Define the Environment Bindings
 */
type Env = {
  API_KEY: string;
  CHANNEL_DISCORD_COACHAIGENT_CRM_WEBHOOK: string;
  CHANNEL_DISCORD_DEVSECOPS_WEBHOOK: string;
};

// Top-level strongly-typed environment access
const { API_KEY: serverKey } = env as unknown as Env;

const app = new Hono();

// Auth Middleware: Verify API Key using the global environment
app.use('/v1/*', async (c, next) => {
  const apiKey = c.req.header('X-Api-Key');

  if (!serverKey) {
    console.error('CRITICAL: API_KEY is not configured on the server.');
    return c.json({
      success: false,
      message: 'Server API_KEY not configured'
    }, 500);
  }

  if (apiKey !== serverKey) {
    console.warn('Unauthorized access attempt detected.');
    return c.json({
      success: false,
      message: 'Invalid API key'
    }, 401);
  }
  await next();
});

// Health & Auth Check: Verify connectivity and API key without sending notifications
app.get('/v1/health', (c) => {
  return c.json({ success: true, message: 'Authentication valid' });
});

// Notify Endpoint: Generic handler for all event sources
app.post('/v1/notify', async (c) => {
  try {
    const payload: NotifyPayload = await c.req.json();
    // Use the global env for the factory as well
    const command = NotificationFactory.create(payload, env);
    await command.execute();

    return c.json({ success: true, message: 'Notification sent successfully.' });
  } catch (error: any) {
    console.error('Notification failed:', error);
    return c.json({
      success: false,
      code: 'ERR_NOTIFY_EXEC_FAIL',
      message: error.message || 'Internal server error while processing notification.'
    }, 500);
  }
});

export const onRequest = handle(app);

export default app;
