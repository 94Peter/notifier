import { env } from 'cloudflare:workers';
import type { NotifyPayload } from '../types/index.js';

/**
 * NotificationCommand interface defines the standard execution method
 */
export interface NotificationCommand {
  execute(): Promise<void>;
}

/**
 * DiscordCommand handles sending and formatting messages to Discord
 */
export class DiscordCommand implements NotificationCommand {
  private payload: NotifyPayload;

  constructor(payload: NotifyPayload) {
    this.payload = payload;
  }

  async execute(): Promise<void> {
    const webhookUrl = this.getWebhookUrl(this.payload.source);
    const embedColor = this.getEmbedColor(this.payload.type);
    const fields = this.formatMetadata(this.payload.metadata);

    const body = {
      embeds: [{
        title: `[${this.payload.event}] ${this.payload.source}`,
        description: this.payload.message,
        color: embedColor,
        fields: fields,
        timestamp: new Date().toISOString(),
      }]
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`Discord Webhook failed with status: ${response.status}`);
    }
  }

  private getWebhookUrl(source: string): string {
    // These keys must match what we have in Infisical/Cloudflare Dashboard
    const envRecord = env as any;
    let url: string | undefined;

    switch (source) {
      case 'coach-aigent-crm':
        url = envRecord.CHANNEL_DISCORD_COACHAIGENT_CRM_WEBHOOK;
        break;
      case 'devsecops':
        url = envRecord.CHANNEL_DISCORD_DEVSECOPS_WEBHOOK;
        break;
      default:
        throw new Error(`Unsupported source for webhook resolution: ${source}`);
    }

    if (!url) {
      throw new Error(`Missing Discord Webhook URL for source: ${source}`);
    }

    return url;
  }

  private getEmbedColor(type: string): number {
    switch (type) {
      case 'success': return 0x2ecc71;
      case 'info': return 0x3498db;
      case 'warning': return 0xf1c40f;
      case 'error':
      case 'critical': return 0xe74c3c;
      default: return 0x95a5a6;
    }
  }

  private formatMetadata(metadata?: Record<string, unknown>) {
    if (!metadata) return [];
    return Object.entries(metadata).map(([key, value]) => ({
      name: key,
      value: typeof value === 'object' ? JSON.stringify(value) : String(value),
      inline: true
    }));
  }
}
