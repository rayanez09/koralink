export interface PaymentProvider {
    /**
     * Initializes a payment (Collection) and returns a checkout URL.
     */
    initializePayment(params: PaymentParams): Promise<TransferResult>

    /**
     * Initializes a payout (Transfer) and returns a provider-specific ID.
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

export interface PaymentParams {
    amount: number
    currency: string
    description: string
    customerName: string
    customerEmail: string
    customerPhone: string
    referenceId: string
    successUrl: string
    cancelUrl: string
}

export interface TransferParams {
    amount: number
    currency: string       // Currency of the RECEIVER
    senderCurrency: string  // Currency of the SENDER
    recipientNumber: string
    recipientName: string
    senderCountry: string
    receiverCountry: string
    referenceId: string // Internal transaction ID
    payoutMethod: string // e.g: orange_ci, mtn_sn, mpesa_ke
}

export interface TransferResult {
    success: boolean
    providerTransactionId?: string
    checkoutUrl?: string
    errorMessage?: string
}

export interface WebhookEvent {
    providerTransactionId: string
    status: 'success' | 'failed' | 'pending'
    type: 'payment' | 'payout'
    originalPayload: any
}
