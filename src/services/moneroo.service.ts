import crypto from 'crypto'
import { PaymentProvider, TransferParams, TransferResult, WebhookEvent } from './payment-provider.interface'
import { countryPayoutMethods } from '@/lib/countries'

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

    async initializeTransfer(params: TransferParams): Promise<TransferResult> {
        // Fallback for local development if keys are missing
        if (!this.apiKey || this.apiKey === 'mock_moneroo_api_key') {
            console.log('[MonerooService] Running in MOCK mode (No API Key provided)')
            return this.mockTransfer(params)
        }

        try {
            console.log('[MonerooService] Initializing real transfer to Moneroo...')

            // Format phone number to avoid spacing issues
            const phone = params.recipientNumber.replace(/\s+/g, '')

            // Moneroo Payout Payload
            const payload = {
                amount: params.amount,
                currency: params.currency,
                method: params.payoutMethod, // Dynamically selected by the user on frontend
                customer: {
                    phone: phone,
                    first_name: "Client",
                    last_name: "KoraLink"
                },
                metadata: {
                    reference_id: params.referenceId
                }
            }

            const response = await fetch('https://api.moneroo.io/v1/payouts/initialize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            })

            const data = await response.json()

            if (!response.ok) {
                console.error('[MonerooService] API Error:', data)
                throw new Error(data.message || 'Le fournisseur de paiement a rejeté le transfert.')
            }

            return {
                success: true,
                providerTransactionId: data.data?.id || `txn_${Date.now()}`
            }

        } catch (error: any) {
            console.error('[MonerooService] Transfer initialization failed:', error)
            return {
                success: false,
                errorMessage: error.message
            }
        }
    }

    private mockTransfer(params: TransferParams): Promise<TransferResult> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const mockProviderId = `mock_txn_${Math.random().toString(36).substring(7)}`
                console.log(`[MonerooService.mock] Transfer initialized with ID: ${mockProviderId}`)
                resolve({
                    success: true,
                    providerTransactionId: mockProviderId,
                })
            }, 1000)
        })
    }

    verifyWebhookSignature(payload: string, signature: string): boolean {
        if (!this.webhookSecret || this.webhookSecret === 'mock_moneroo_webhook_secret') {
            console.log('[MonerooService] Webhook validation mocked (no secret key)')
            return true
        }

        try {
            const hash = crypto
                .createHmac('sha256', this.webhookSecret)
                .update(payload)
                .digest('hex')

            return hash === signature
        } catch (e) {
            console.error('[MonerooService] Signature verification failed', e)
            return false
        }
    }

    parseWebhookEvent(payload: any): WebhookEvent {
        let status: 'success' | 'failed' | 'pending' = 'pending'

        // Moneroo payout webhook specifics
        if (payload.event === 'payout.successful' || payload.data?.status === 'successful' || payload.data?.status === 'success') {
            status = 'success'
        } else if (payload.event === 'payout.failed' || payload.data?.status === 'failed') {
            status = 'failed'
        }

        return {
            providerTransactionId: payload.data?.id || payload.data?.transaction_id || 'unknown',
            status,
            originalPayload: payload,
        }
    }
}

// Export a singleton instance
export const paymentProvider = new MonerooService()
