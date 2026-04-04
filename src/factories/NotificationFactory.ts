import type { NotifyPayload } from '../types/index.js';
import { DiscordCommand } from '../commands/DiscordCommand.js';
import type { NotificationCommand } from '../commands/DiscordCommand.js';

export class NotificationFactory {
  static create(payload: NotifyPayload, env: any): NotificationCommand {
    const envRecord = env as any;
    let webhookUrl: string | undefined;

    switch (payload.source) {
      case 'coach-aigent-crm':
        webhookUrl = envRecord.CHANNEL_DISCORD_COACHAIGENT_CRM_WEBHOOK;
        break;
      case 'devsecops':
        webhookUrl = envRecord.CHANNEL_DISCORD_DEVSECOPS_WEBHOOK;
        break;
      default:
        throw new Error(`Unsupported source: ${payload.source}`);
    }

    if (!webhookUrl) {
      throw new Error(`Missing Discord Webhook URL for source: ${payload.source}`);
    }

    return new DiscordCommand(webhookUrl, payload);
  }
}
