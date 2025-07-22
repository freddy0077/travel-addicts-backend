import axios from 'axios';

interface PaystackInitializeRequest {
  email: string;
  amount: number; // Amount in kobo (smallest currency unit)
  currency?: string;
  reference?: string;
  callback_url?: string;
  metadata?: any;
}

interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    reference: string;
    amount: number;
    status: string;
    gateway_response: string;
    paid_at: string | null;
    created_at: string;
    channel: string;
    currency: string;
    customer: {
      id: number;
      first_name: string | null;
      last_name: string | null;
      email: string;
      phone: string | null;
    };
  };
}

class PaystackService {
  private secretKey: string;
  private baseUrl = 'https://api.paystack.co';

  constructor() {
    this.secretKey = process.env.PAYSTACK_SECRET_KEY || '';
    if (!this.secretKey) {
      console.warn('⚠️  PAYSTACK_SECRET_KEY not found in environment variables');
    }
  }

  private getHeaders() {
    return {
      Authorization: `Bearer ${this.secretKey}`,
      'Content-Type': 'application/json',
    };
  }

  async initializeTransaction(data: PaystackInitializeRequest): Promise<PaystackInitializeResponse> {
    try {
      console.log('🔄 Initializing Paystack transaction:', {
        email: data.email,
        amount: data.amount,
        currency: data.currency || 'GHS'
      });

      const response = await axios.post(
        `${this.baseUrl}/transaction/initialize`,
        {
          ...data,
          currency: data.currency || 'GHS',
          reference: data.reference || this.generateReference(),
        },
        {
          headers: this.getHeaders(),
        }
      );

      console.log('✅ Paystack initialization successful:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Paystack initialization failed:', error.response?.data || error.message);
      throw new Error(`Payment initialization failed: ${error.response?.data?.message || error.message}`);
    }
  }

  async verifyTransaction(reference: string): Promise<PaystackVerifyResponse> {
    try {
      console.log('🔍 Verifying Paystack transaction:', reference);

      const response = await axios.get(
        `${this.baseUrl}/transaction/verify/${reference}`,
        {
          headers: this.getHeaders(),
        }
      );

      console.log('✅ Paystack verification successful:', {
        reference,
        status: response.data.data?.status,
        amount: response.data.data?.amount
      });

      return response.data;
    } catch (error: any) {
      console.error('❌ Paystack verification failed:', error.response?.data || error.message);
      throw new Error(`Payment verification failed: ${error.response?.data?.message || error.message}`);
    }
  }

  private generateReference(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `TRA_${timestamp}_${random}`.toUpperCase();
  }

  // Convert amount from pesewas to kobo (Paystack uses kobo for GHS)
  convertPesewasToKobo(pesewas: number): number {
    return pesewas; // 1 pesewa = 1 kobo (both are 1/100 of main currency)
  }

  // Convert amount from kobo to pesewas
  convertKoboToPesewas(kobo: number): number {
    return kobo; // 1 kobo = 1 pesewa (both are 1/100 of main currency)
  }
}

export const paystackService = new PaystackService();
export default PaystackService;
