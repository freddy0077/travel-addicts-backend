"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paystackService = void 0;
const axios_1 = __importDefault(require("axios"));
class PaystackService {
    constructor() {
        this.baseUrl = 'https://api.paystack.co';
        this.secretKey = process.env.PAYSTACK_SECRET_KEY || '';
        if (!this.secretKey) {
            console.warn('⚠️  PAYSTACK_SECRET_KEY not found in environment variables');
        }
    }
    getHeaders() {
        return {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
        };
    }
    async initializeTransaction(data) {
        try {
            console.log('🔄 Initializing Paystack transaction:', {
                email: data.email,
                amount: data.amount,
                currency: data.currency || 'GHS'
            });
            const response = await axios_1.default.post(`${this.baseUrl}/transaction/initialize`, {
                ...data,
                currency: data.currency || 'GHS',
                reference: data.reference || this.generateReference(),
            }, {
                headers: this.getHeaders(),
            });
            console.log('✅ Paystack initialization successful:', response.data);
            return response.data;
        }
        catch (error) {
            console.error('❌ Paystack initialization failed:', error.response?.data || error.message);
            throw new Error(`Payment initialization failed: ${error.response?.data?.message || error.message}`);
        }
    }
    async verifyTransaction(reference) {
        try {
            console.log('🔍 Verifying Paystack transaction:', reference);
            const response = await axios_1.default.get(`${this.baseUrl}/transaction/verify/${reference}`, {
                headers: this.getHeaders(),
            });
            console.log('✅ Paystack verification successful:', {
                reference,
                status: response.data.data?.status,
                amount: response.data.data?.amount
            });
            return response.data;
        }
        catch (error) {
            console.error('❌ Paystack verification failed:', error.response?.data || error.message);
            throw new Error(`Payment verification failed: ${error.response?.data?.message || error.message}`);
        }
    }
    generateReference() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 15);
        return `TRA_${timestamp}_${random}`.toUpperCase();
    }
    // Convert amount from pesewas to kobo (Paystack uses kobo for GHS)
    convertPesewasToKobo(pesewas) {
        return pesewas; // 1 pesewa = 1 kobo (both are 1/100 of main currency)
    }
    // Convert amount from kobo to pesewas
    convertKoboToPesewas(kobo) {
        return kobo; // 1 kobo = 1 pesewa (both are 1/100 of main currency)
    }
}
exports.paystackService = new PaystackService();
exports.default = PaystackService;
