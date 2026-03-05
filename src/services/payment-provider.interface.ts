export interface PaymentProvider {
    /**
     * Initializes a payment/transfer and returns a provider-specific transaction ID or URL.
     */
    initializeTransfer(params: TransferParams): Promise<TransferResult>

    /**
     * Verifies the signature of a webhook payload to ensure it comes from the provider.
     */
    verifyWebhookSignature(payload: string, signature: string): boolean

    /**
     * Parses the webhook payload into a standardized format.
     */
    parseWebhookEvent(payload: any): WebhookEvent
}

export interface TransferParams {
    amount: number
    currency: string
    recipientNumber: string
    senderCountry: string
    receiverCountry: string
    referenceId: string // Internal transaction ID
    payoutMethod: string // e.g: orange_money, mtn, mpesa
}

export interface TransferResult {
    success: boolean
    providerTransactionId?: string
    errorMessage?: string
}

export interface WebhookEvent {
    providerTransactionId: string
    status: 'success' | 'failed' | 'pending'
    originalPayload: any
}
