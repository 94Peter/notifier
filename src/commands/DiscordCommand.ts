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
  private webhookUrl: string;
  private payload: NotifyPayload;

  constructor(webhookUrl: string, payload: NotifyPayload) {
    this.webhookUrl = webhookUrl;
    this.payload = payload;
  }

  async execute(): Promise<void> {
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

    const response = await fetch(this.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`Discord Webhook failed with status: ${response.status}`);
    }
  }

  private getEmbedColor(type: string): number {
    switch (type) {
      case 'success': return 0x2ecc71; // Green
      case 'error': return 0xe74c3c;   // Red
      case 'warning': return 0xf1c40f; // Yellow
      case 'info': return 0x3498db;    // Blue
      default: return 0x95a5a6;        // Gray
    }
  }

  private formatMetadata(metadata?: Record<string, any>) {
    if (!metadata) return [];
    return Object.entries(metadata).map(([key, value]) => ({
      name: key,
      value: String(value),
      inline: true
    }));
  }
}
