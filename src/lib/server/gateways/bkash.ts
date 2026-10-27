/**
 * bKash Tokenized Checkout API Client
 * Enterprise-grade implementation conforming to bKash PGW API specification.
 */

interface BkashCredentials {
  appKey: string;
  appSecret: string;
  username: string;
  password: string;
  isSandbox?: boolean;
}

interface BkashTokenResponse {
  statusCode: string;
  statusMessage: string;
  id_token?: string;
  token_type?: string;
  expires_in?: number;
  refresh_token?: string;
}

interface BkashCreatePaymentResponse {
  statusCode: string;
  statusMessage: string;
  paymentID?: string;
  bkashURL?: string;
  callbackURL?: string;
  amount?: string;
  intent?: string;
  currency?: string;
  paymentCreateTime?: string;
  transactionStatus?: string;
  merchantInvoiceNumber?: string;
}

interface BkashExecutePaymentResponse {
  statusCode: string;
  statusMessage: string;
  paymentID?: string;
  trxID?: string;
  transactionStatus?: string;
  amount?: string;
  currency?: string;
  intent?: string;
  merchantInvoiceNumber?: string;
  customerMsisdn?: string;
  paymentExecuteTime?: string;
}

export class BkashGateway {
  private credentials: BkashCredentials;
  private baseUrl: string;
  private idToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor(credentials?: Partial<BkashCredentials>) {
    this.credentials = {
      appKey: credentials?.appKey || process.env.BKASH_APP_KEY || '',
      appSecret: credentials?.appSecret || process.env.BKASH_APP_SECRET || '',
      username: credentials?.username || process.env.BKASH_USERNAME || '',
      password: credentials?.password || process.env.BKASH_PASSWORD || '',
      isSandbox: credentials?.isSandbox ?? (process.env.BKASH_IS_SANDBOX !== 'false'),
    };

    this.baseUrl = this.credentials.isSandbox
      ? 'https://tokenized.sandbox.bka.sh/v1.2.0-beta'
      : 'https://tokenized.pay.bka.sh/v1.2.0-beta';
  }

  /**
   * Check if credentials are validly supplied
   */
  public isConfigured(): boolean {
    return !!(
      this.credentials.appKey &&
      this.credentials.appSecret &&
      this.credentials.username &&
      this.credentials.password
    );
  }

  /**
   * Grant or reuse auth token from bKash server
   */
  public async grantToken(): Promise<string> {
    if (this.idToken && Date.now() < this.tokenExpiry) {
      return this.idToken;
    }

    if (!this.isConfigured()) {
      throw new Error('bKash credentials are not configured. Please supply BKASH_APP_KEY, BKASH_APP_SECRET, etc.');
    }

    const response = await fetch(`${this.baseUrl}/tokenized/checkout/token/grant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        username: this.credentials.username,
        password: this.credentials.password,
      },
      body: JSON.stringify({
        app_key: this.credentials.appKey,
        app_secret: this.credentials.appSecret,
      }),
    });

    const data: BkashTokenResponse = await response.json();

    if (data.statusCode === '0000' && data.id_token) {
      this.idToken = data.id_token;
      // Expires in seconds (usually 3600), subtract 60s safety buffer
      this.tokenExpiry = Date.now() + ((data.expires_in || 3600) - 60) * 1000;
      return this.idToken;
    }

    throw new Error(`bKash Token Grant Failed: [${data.statusCode}] ${data.statusMessage}`);
  }

  /**
   * Create checkout payment url
   */
  public async createPayment(params: {
    amount: number;
    merchantInvoiceNumber: string;
    callbackURL: string;
    payerReference?: string;
  }): Promise<BkashCreatePaymentResponse> {
    const token = await this.grantToken();

    const response = await fetch(`${this.baseUrl}/tokenized/checkout/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: token,
        'X-APP-Key': this.credentials.appKey,
      },
      body: JSON.stringify({
        mode: '0011',
        payerReference: params.payerReference || 'SamityPro',
        callbackURL: params.callbackURL,
        amount: params.amount.toFixed(2),
        currency: 'BDT',
        intent: 'sale',
        merchantInvoiceNumber: params.merchantInvoiceNumber,
      }),
    });

    const data: BkashCreatePaymentResponse = await response.json();
    return data;
  }

  /**
   * Execute payment upon customer OTP & PIN confirmation
   */
  public async executePayment(paymentID: string): Promise<BkashExecutePaymentResponse> {
    const token = await this.grantToken();

    const response = await fetch(`${this.baseUrl}/tokenized/checkout/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: token,
        'X-APP-Key': this.credentials.appKey,
      },
      body: JSON.stringify({ paymentID }),
    });

    const data: BkashExecutePaymentResponse = await response.json();
    return data;
  }

  /**
   * Query status of an existing paymentID
   */
  public async queryPayment(paymentID: string): Promise<Record<string, unknown>> {
    const token = await this.grantToken();

    const response = await fetch(`${this.baseUrl}/tokenized/checkout/payment/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: token,
        'X-APP-Key': this.credentials.appKey,
      },
      body: JSON.stringify({ paymentID }),
    });

    return response.json();
  }
}
