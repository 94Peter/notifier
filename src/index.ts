import { Hono } from 'hono';
import { handle } from 'hono/cloudflare-pages';
import type { Bindings, NotifyPayload } from './types/index.js';
import { NotificationFactory } from './factories/NotificationFactory.js';

const app = new Hono<{ Bindings: Bindings }>();

/**
 * Middleware: Verify X-Api-Key before processing the notification
 */
app.use('/v1/*', async (c, next) => {
  const apiKey = c.req.header('X-Api-Key');
  console.log(apiKey, c.env.API_KEY);
  if (apiKey !== c.env.API_KEY) {
    return c.json({
      success: false,
      code: 'ERR_AUTH_FAILED',
      message: 'Invalid or missing X-Api-Key.'
    }, 401);
  }
  await next();
});

/**
 * POST /v1/notify - Route and send the notification via the factory
 */
app.post('/v1/notify', async (c) => {
  try {
    const payload: NotifyPayload = await c.req.json();

    // Use the factory to create a command and execute it
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
