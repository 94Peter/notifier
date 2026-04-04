import { Hono } from 'hono';
import { handle } from 'hono/cloudflare-pages';
import type { NotifyPayload } from './types/index.js';
import { NotificationFactory } from './factories/NotificationFactory.js';

type Env = {
  API_KEY: string;
  CHANNEL_DISCORD_COACHAIGENT_CRM_WEBHOOK: string;
  CHANNEL_DISCORD_DEVSECOPS_WEBHOOK: string;
};

const app = new Hono<{ Bindings: Env }>();

// Auth Middleware: Verify API Key using the Request Context (env)
app.use('/v1/*', async (c, next) => {
  const apiKey = c.req.header('X-Api-Key');
  const serverKey = c.env.API_KEY;

  if (!serverKey) {
    console.error('CRITICAL: API_KEY is not configured on the server.');
    return c.json({
      success: false,
      message: 'Server API_KEY not configured'
    }, 500);
  }

  if (apiKey !== serverKey) {
    console.warn(`Unauthorized access attempt: Request Key="${apiKey}", Server Key="${serverKey}"`);
    return c.json({
      success: false,
      message: 'Invalid API key'
    }, 401);
  }
  await next();
});

// Notify Endpoint: Generic handler for all event sources
app.post('/v1/notify', async (c) => {
  try {
    const payload: NotifyPayload = await c.req.json();
    const command = NotificationFactory.create(payload, c.env);
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
