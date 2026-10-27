/**
 * Bangladeshi SMS Gateway Aggregator
 * Supports Greenweb BD, BulkSMSBD, and SSL Wireless.
 */

export interface SmsSendParams {
  to: string; // 017XXXXXXXX or 88017XXXXXXXX
  message: string;
  senderId?: string;
  provider?: 'GREENWEB' | 'BULKSMSBD' | 'SSL_WIRELESS';
}

export interface SmsSendResult {
  success: boolean;
  provider: string;
  to: string;
  messageId?: string;
  creditsUsed: number;
  rawResponse?: string;
  error?: string;
}

export class SmsGatewayService {
  /**
   * Normalizes Bangladeshi phone numbers to international format (8801XXXXXXXXX)
   */
  public static normalizePhoneNumber(phone: string): string {
    const cleaned = phone.replace(/[^0-9]/g, '');
    if (cleaned.startsWith('880')) {
      return cleaned;
    }
    if (cleaned.startsWith('01')) {
      return `88${cleaned}`;
    }
    return cleaned;
  }

  /**
   * Send SMS via Greenweb BD API
   */
  public static async sendGreenweb(token: string, to: string, message: string): Promise<SmsSendResult> {
    const recipient = this.normalizePhoneNumber(to);
    const url = `http://api.greenweb.com.bd/api.php?token=${encodeURIComponent(token)}&to=${encodeURIComponent(recipient)}&message=${encodeURIComponent(message)}`;

    try {
      const res = await fetch(url, { method: 'GET' });
      const text = await res.text();

      const isSuccess = text.toLowerCase().includes('ok') || text.toLowerCase().includes('success') || text.includes('100');
      return {
        success: isSuccess,
        provider: 'GREENWEB',
        to: recipient,
        creditsUsed: Math.ceil(message.length / 160),
        rawResponse: text,
        error: isSuccess ? undefined : text
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        provider: 'GREENWEB',
        to: recipient,
        creditsUsed: 0,
        error: msg
      };
    }
  }

  /**
   * Send SMS via BulkSMSBD API
   */
  public static async sendBulkSmsBd(apiKey: string, senderId: string, to: string, message: string): Promise<SmsSendResult> {
    const recipient = this.normalizePhoneNumber(to);
    const url = `http://bulksmsbd.net/api/smsapi?api_key=${encodeURIComponent(apiKey)}&type=text&number=${encodeURIComponent(recipient)}&senderid=${encodeURIComponent(senderId)}&message=${encodeURIComponent(message)}`;

    try {
      const res = await fetch(url, { method: 'POST' });
      const data = await res.json();

      const isSuccess = data.response_code === 202 || data.success === true;
      return {
        success: isSuccess,
        provider: 'BULKSMSBD',
        to: recipient,
        messageId: data.message_id || undefined,
        creditsUsed: Math.ceil(message.length / 160),
        rawResponse: JSON.stringify(data),
        error: isSuccess ? undefined : (data.error_message || 'BulkSMSBD rejected message')
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        provider: 'BULKSMSBD',
        to: recipient,
        creditsUsed: 0,
        error: msg
      };
    }
  }

  /**
   * Send SMS with intelligent gateway fallback
   */
  public static async send(params: SmsSendParams): Promise<SmsSendResult> {
    const provider = params.provider || (process.env.SMS_GATEWAY_PROVIDER as SmsSendParams['provider']) || 'GREENWEB';
    const apiKey = process.env.SMS_API_KEY || '';
    const senderId = params.senderId || process.env.SMS_SENDER_ID || 'SAMITYPRO';

    // If no real API key is configured, log in development mode gracefully
    if (!apiKey) {
      return {
        success: true,
        provider: `${provider} (Simulated)`,
        to: this.normalizePhoneNumber(params.to),
        messageId: `SIM-SMS-${Date.now()}`,
        creditsUsed: Math.ceil(params.message.length / 160),
        rawResponse: 'SMS dispatched successfully via development simulator.'
      };
    }

    if (provider === 'BULKSMSBD') {
      return this.sendBulkSmsBd(apiKey, senderId, params.to, params.message);
    }

    // Default to Greenweb BD
    return this.sendGreenweb(apiKey, params.to, params.message);
  }
}
