import crypto from 'crypto'
import { PaymentParams, PaymentProvider, TransferParams, TransferResult, WebhookEvent } from './payment-provider.interface'

/**
 * Moneroo implementation of the PaymentProvider interface.
 */
export class MonerooService implements PaymentProvider {
    private apiKey: string
    private webhookSecret: string

    constructor() {
        this.apiKey = process.env.MONEROO_API_KEY || ''
        this.webhookSecret = process.env.MONEROO_WEBHOOK_SECRET || ''
    }

    async initializePayment(params: PaymentParams): Promise<TransferResult> {
        if (!this.apiKey || this.apiKey === 'mock_moneroo_api_key' || !this.apiKey.startsWith('mon_')) {
            console.log('[MonerooService] Payment mocked')
            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'http://localhost:3000'
            return {
                success: true,
                providerTransactionId: 'mock_payment_' + Date.now(),
                checkoutUrl: `${baseUrl}/dashboard/transfer/success?mock=true&ref=${params.referenceId}`
            }
        }

        try {
            const payload = {
                amount: Math.round(params.amount),
                currency: params.currency,
                description: params.description,
                customer: {
                    first_name: params.customerName.split(' ')[0] || 'Client',
                    last_name: params.customerName.split(' ').slice(1).join(' ') || 'KoraLink',
                    email: params.customerEmail,
                    phone: params.customerPhone.replace(/\s+/g, '')
                },
                return_url: params.successUrl,
                cancel_url: params.cancelUrl,
                metadata: {
                    reference_id: params.referenceId,
                    type: 'collection'
                }
            }

            const response = await fetch('https://api.moneroo.io/v1/payments/initialize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify(payload)
            })

            const data = await response.json()
            if (!response.ok) throw new Error(data.message || 'Payment initialization failed')

            const checkoutUrl = data.data?.checkout_url || data.checkout_url
            const providerId = data.data?.id || data.id

            if (!checkoutUrl) throw new Error('Moneroo did not return a checkout URL')

            return {
                success: true,
                providerTransactionId: providerId,
                checkoutUrl: checkoutUrl
            }
        } catch (error: any) {
            return { success: false, errorMessage: error.message }
        }
    }

    async initializeTransfer(params: TransferParams): Promise<TransferResult> {
        if (!this.apiKey || this.apiKey === 'mock_moneroo_api_key' || !this.apiKey.startsWith('mon_')) {
            console.log('[MonerooService] Payout mocked')
            return {
                success: true,
                providerTransactionId: 'mock_payout_' + Date.now()
            }
        }

        try {
            const payload = {
                amount: Math.round(params.amount),
                currency: params.currency,
                method: params.payoutMethod,
                description: `Transfert KoraLink - ${params.referenceId}`,
                customer: {
                    phone: params.recipientNumber.replace(/\s+/g, ''),
                    first_name: params.recipientName.split(' ')[0] || 'Inconnu',
                    last_name: params.recipientName.split(' ').slice(1).join(' ') || 'KoraLink',
                    email: `transfer+${params.referenceId}@koralink.app`
                },
                metadata: {
                    reference_id: params.referenceId
                }
            }

            const response = await fetch('https://api.moneroo.io/v1/payouts/initialize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify(payload)
            })

            const data = await response.json()
            if (!response.ok) throw new Error(data.message || 'Payout failed')

            return {
                success: true,
                providerTransactionId: data.data?.id
            }
        } catch (error: any) {
            return { success: false, errorMessage: error.message }
        }
    }

    verifyWebhookSignature(payload: string, signature: string): boolean {
        if (!this.webhookSecret || this.webhookSecret === 'mock_moneroo_webhook_secret') {
            return true
        }

        try {
            const hash = crypto
                .createHmac('sha256', this.webhookSecret)
                .update(payload)
                .digest('hex')

            return hash === signature
        } catch (e) {
            return false
        }
    }

    parseWebhookEvent(payload: any): WebhookEvent {
        let status: 'success' | 'failed' | 'pending' = 'pending'
        const eventType = payload.event || ''
        const type: 'payment' | 'payout' = eventType.startsWith('payout') ? 'payout' : 'payment'

        const statusStr = payload.data?.status || ''
        if (statusStr === 'successful' || statusStr === 'success' || eventType.endsWith('.successful')) {
            status = 'success'
        } else if (statusStr === 'failed' || eventType.endsWith('.failed')) {
            status = 'failed'
        }

        return {
            providerTransactionId: payload.data?.id || payload.data?.transaction_id || 'unknown',
            status,
            type,
            originalPayload: payload,
        }
    }
}

export const paymentProvider = new MonerooService()
