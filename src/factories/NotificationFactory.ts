import type { Bindings, NotifyPayload } from '../types/index.js';
import { DiscordCommand } from '../commands/DiscordCommand.js';
import type { NotificationCommand } from '../commands/DiscordCommand.js';

export class NotificationFactory {
  static create(payload: NotifyPayload, env: Bindings): NotificationCommand {
    let webhookUrl: string;

    switch (payload.source) {
      case 'coach-aigent-crm':
        webhookUrl = env.CHANNEL_DISCORD_COACHAIGENT_CRM_WEBHOOK;
        break;
      case 'devsecops':
        webhookUrl = env.CHANNEL_DISCORD_DEVSECOPS_WEBHOOK;
        break;
      default:
        throw new Error(`Unsupported source: ${payload.source}`);
    }
    return new DiscordCommand(webhookUrl, payload);
  }
}
