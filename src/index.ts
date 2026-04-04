import { Hono } from 'hono';
import { handle } from 'hono/cloudflare-pages';
import { env } from 'cloudflare:workers';
import type { NotifyPayload } from './types/index.js';
import { NotificationFactory } from './factories/NotificationFactory.js';

const app = new Hono();
// Auth Middleware: Verify API Key from the global environment
app.use('/v1/*', async (c, next) => {
  const apiKey = c.req.header('X-Api-Key');
  const serverKey = env.API_KEY;

  console.log('--- [Auth Debug] ---');
  console.log('Request Key:', apiKey);
  console.log('Global Env Key:', serverKey);

  if (apiKey !== serverKey) {
    return c.json({
      success: false,
      message: 'Invalid or missing X-Api-Key'
    }, 401);
  }
  await next();
});

// Notify Endpoint: Generic handler for all event sources
app.post('/v1/notify', async (c) => {
  try {
    const payload: NotifyPayload = await c.req.json();
    const command = NotificationFactory.create(payload);
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
