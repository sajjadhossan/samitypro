/**
 * Meta WhatsApp Business Cloud API Client
 * Enterprise-grade WhatsApp messaging engine.
 */

export interface WhatsAppSendParams {
  to: string; // 8801XXXXXXXXX or 01XXXXXXXXX
  message: string;
  templateName?: string;
  templateLanguage?: string;
  templateComponents?: Array<Record<string, unknown>>;
}

export interface WhatsAppSendResult {
  success: boolean;
  messageId?: string;
  recipient: string;
  provider: string;
  error?: string;
}

export class WhatsAppCloudService {
  private static phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
  private static accessToken = process.env.WHATSAPP_ACCESS_TOKEN || '';

  /**
   * Format phone number to WhatsApp international standard (e.g. 88017XXXXXXXX)
   */
  public static normalizePhoneNumber(phone: string): string {
    const cleaned = phone.replace(/[^0-9]/g, '');
    if (cleaned.startsWith('880')) return cleaned;
    if (cleaned.startsWith('01')) return `88${cleaned}`;
    return cleaned;
  }

  /**
   * Send WhatsApp Message via Meta Graph API v18.0
   */
  public static async send(params: WhatsAppSendParams): Promise<WhatsAppSendResult> {
    const recipient = this.normalizePhoneNumber(params.to);

    // If Meta API credentials are not set in environment, gracefully simulate
    if (!this.phoneNumberId || !this.accessToken) {
      return {
        success: true,
        provider: 'Meta Cloud API (Simulated)',
        recipient,
        messageId: `wamid.SIMULATED_${Date.now()}`
      };
    }

    const url = `https://graph.facebook.com/v18.0/${this.phoneNumberId}/messages`;

    const payload = params.templateName ? {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipient,
      type: 'template',
      template: {
        name: params.templateName,
        language: { code: params.templateLanguage || 'bn' },
        components: params.templateComponents || []
      }
    } : {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipient,
      type: 'text',
      text: { body: params.message }
    };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.accessToken}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.messages && data.messages.length > 0) {
        return {
          success: true,
          provider: 'Meta WhatsApp Cloud',
          recipient,
          messageId: data.messages[0].id
        };
      }

      return {
        success: false,
        provider: 'Meta WhatsApp Cloud',
        recipient,
        error: data.error?.message || 'Failed to dispatch WhatsApp message via Meta Cloud API'
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        provider: 'Meta WhatsApp Cloud',
        recipient,
        error: msg
      };
    }
  }
}
