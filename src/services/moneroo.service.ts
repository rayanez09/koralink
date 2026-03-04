import { PaymentProvider, TransferParams, TransferResult, WebhookEvent } from './payment-provider.interface'

/**
 * Moneroo implementation of the PaymentProvider interface.
 * Currently mocked for MVP purposes.
 */
export class MonerooService implements PaymentProvider {
    private apiKey: string
    private webhookSecret: string

    constructor() {
        this.apiKey = process.env.MONEROO_API_KEY || ''
        this.webhookSecret = process.env.MONEROO_WEBHOOK_SECRET || ''
    }

    async initializeTransfer(params: TransferParams): Promise<TransferResult> {
        // MOCK: Simulate API call to Moneroo
        console.log('[MonerooService.mock] Initializing transfer:', params)

        return new Promise((resolve) => {
            setTimeout(() => {
                // Simulate a successful response from Moneroo
                const mockProviderId = `moneroo_txn_${Math.random().toString(36).substring(7)}`

                console.log(`[MonerooService.mock] Transfer initialized with ID: ${mockProviderId}`)
                resolve({
                    success: true,
                    providerTransactionId: mockProviderId,
                })
            }, 1000)
        })
    }

    verifyWebhookSignature(payload: string, signature: string): boolean {
        // MOCK: In a real scenario, use crypto to verify HMAC SHA256 signature
        // using this.webhookSecret
        console.log('[MonerooService.mock] Verifying webhook signature...')
        return true // Always trust for MVP mock
    }

    parseWebhookEvent(payload: any): WebhookEvent {
        // MOCK: Map Moneroo's specific payload to our standard WebhookEvent
        // Moneroo payload example: { event: 'transaction.success', data: { transaction_id: '...', status: 'success' } }

        let status: 'success' | 'failed' | 'pending' = 'pending'
        if (payload.event === 'transaction.success' || payload.data?.status === 'success') {
            status = 'success'
        } else if (payload.event === 'transaction.failed' || payload.data?.status === 'failed') {
            status = 'failed'
        }

        return {
            providerTransactionId: payload.data?.transaction_id || 'unknown',
            status,
            originalPayload: payload,
        }
    }
}

// Export a singleton instance
export const paymentProvider = new MonerooService()
