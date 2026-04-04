import type { NotifyPayload } from '../types/index.js';
import { DiscordCommand } from '../commands/DiscordCommand.js';
import type { NotificationCommand } from '../commands/DiscordCommand.js';

export class NotificationFactory {
  static create(payload: NotifyPayload): NotificationCommand {
    return new DiscordCommand(payload);
  }
}
