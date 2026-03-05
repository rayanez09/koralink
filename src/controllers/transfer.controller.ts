import { createClient } from '@/lib/supabase/server'
import { paymentProvider } from '@/services/moneroo.service'

interface TransferRequest {
    senderCountry: string
    receiverCountry: string
    amount: number
    currency: string
    recipientName: string
    recipientNumber: string
    payoutMethod: string
    securityPin?: string
}

// Removed MOCK_EXCHANGE_RATES

export class TransferController {
    static async handleTransfer(userId: string, requestDetails: TransferRequest, ipAddress: string) {
        const supabase = await createClient()

        try {
            // 0. Verify Security PIN (New Feature V4)
            if (!requestDetails.securityPin) {
                throw new Error('Code PIN de sécurité requis.')
            }

            const { data: userProfile, error: userError } = await supabase
                .from('users')
                .select('transactions_pin, is_banned, full_name, email')
                .eq('id', userId)
                .single()

            if (userError) {
                throw new Error('Erreur lors de la récupération du profil.')
            }

            if (userProfile.is_banned) {
                throw new Error('Votre compte a été restreint. Vous ne pouvez plus envoyer d\'argent.')
            }

            if (userError || !userProfile?.transactions_pin) {
                throw new Error('Vous devez configurer un code PIN dans votre profil avant de pouvoir envoyer de l\'argent.')
            }

            if (userProfile.transactions_pin !== requestDetails.securityPin) {
                // Return specific error message to be handled by frontend modal
                throw new Error('Code PIN incorrect. Veuillez réessayer.')
            }

            // 1. Validate constraints, fetch APP_FEE_PERCENTAGE
            const appFeePercentage = parseFloat(process.env.APP_FEE_PERCENTAGE || '0.6')
            const dailyLimit = parseFloat(process.env.DAILY_TRANSFER_LIMIT || '1000')
            const monthlyLimit = parseFloat(process.env.MONTHLY_TRANSFER_LIMIT || '5000')

            // Fetch Real Exchange Rate & USD Rate
            const sender = requestDetails.senderCountry.toLowerCase()
            const receiver = requestDetails.receiverCountry.toLowerCase()

            // Map country to currency
            const destinationCurrencies: Record<string, string> = { 'sn': 'XOF', 'ci': 'XOF', 'gh': 'GHS' }
            const targetCurrency = destinationCurrencies[receiver] || 'XOF'

            let exchangeRate = 1
            if (requestDetails.currency !== targetCurrency) {
                try {
                    const rateRes = await fetch(`https://api.exchangerate-api.com/v4/latest/${requestDetails.currency}`)
                    if (rateRes.ok) {
                        const data = await rateRes.json()
                        exchangeRate = data.rates[targetCurrency] || 1
                    }
                } catch (e) {
                    console.error('Failed to fetch real rate in backend, defaulting to 1', e)
                }
            }

            // Fetch USD rates to normalize limit calculations (since limit is in USD)
            let usdRates: Record<string, number> = {}
            try {
                const usdRes = await fetch('https://api.exchangerate-api.com/v4/latest/USD')
                if (usdRes.ok) {
                    const data = await usdRes.json()
                    usdRates = data.rates
                }
            } catch (e) {
                console.error('Failed to fetch USD rates', e)
            }

            const getAmountInUSD = (amount: number, currency: string) => {
                const rate = usdRates[currency.toUpperCase()]
                if (rate) {
                    return amount / rate
                }
                // Fallback empirique si l'API est indisponible (pour éviter de bloquer)
                if (currency === 'XOF' || currency === 'XAF') return amount / 600
                if (currency === 'UGX') return amount / 3800
                return amount
            }

            // Calculate Fees with Defalcation Logic
            // The amount passed in requestDetails is the Total Charged to user.
            const totalAmountInput = requestDetails.amount
            const appFee = totalAmountInput * (appFeePercentage / 100)
            const netAmountSent = totalAmountInput - appFee // We deduct the fee to find the converted capital

            const totalFee = appFee
            const amountReceived = netAmountSent * exchangeRate

            if (amountReceived <= 0 || netAmountSent <= 0) {
                throw new Error('Le montant saisi est trop faible pour couvrir les frais. Essayez un montant plus élevé.')
            }

            const now = new Date()
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

            const { data: dailyStats, error: dError } = await supabase
                .from('transactions')
                .select('amount_sent, currency_sent')
                .eq('user_id', userId)
                .in('status', ['success', 'pending'])
                .gte('created_at', startOfDay)

            if (dError) throw new Error('Impossible de vérifier vos limites de transfert. Veuillez réessayer.')

            const dailyTotalUSD = dailyStats.reduce((sum, t) => sum + getAmountInUSD(t.amount_sent, t.currency_sent), 0)
            const currentTransferUSD = getAmountInUSD(totalAmountInput, requestDetails.currency)

            // Limit is based on total spent in USD equivalent
            if (dailyTotalUSD + currentTransferUSD > dailyLimit) {
                throw new Error(`⚠️ Vous avez atteint votre limite journalière de ${dailyLimit}$ USD. Revenez demain pour envoyer à nouveau.`)
            }

            const { data: monthlyStats, error: mError } = await supabase
                .from('transactions')
                .select('amount_sent, currency_sent')
                .eq('user_id', userId)
                .in('status', ['success', 'pending'])
                .gte('created_at', startOfMonth)

            if (mError) throw new Error('Impossible de vérifier vos limites de transfert. Veuillez réessayer.')

            const monthlyTotalUSD = monthlyStats.reduce((sum, t) => sum + getAmountInUSD(t.amount_sent, t.currency_sent), 0)
            if (monthlyTotalUSD + currentTransferUSD > monthlyLimit) {
                throw new Error(`⚠️ Vous avez atteint votre limite mensuelle de ${monthlyLimit}$ USD. Vous pourrez envoyer à nouveau le mois prochain.`)
            }

            // 3. Create 'awaiting_payment' transaction in DB
            const { data: transaction, error: insertError } = await supabase
                .from('transactions')
                .insert({
                    user_id: userId,
                    sender_country: requestDetails.senderCountry,
                    receiver_country: requestDetails.receiverCountry,
                    recipient_name: requestDetails.recipientName,
                    recipient_number: requestDetails.recipientNumber,
                    amount_sent: totalAmountInput,
                    currency_sent: requestDetails.currency,
                    exchange_rate: exchangeRate,
                    amount_received: amountReceived,
                    currency_received: targetCurrency,
                    app_fee: appFee,
                    moneroo_fee: 0,
                    total_fee: totalFee,
                    status: 'awaiting_payment', // New status for collection step
                    payout_method: requestDetails.payoutMethod // Store this for later
                })
                .select()
                .single()

            if (insertError || !transaction) throw new Error('Une erreur est survenue lors de la création du transfert.')

            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'http://localhost:3000'
            const providerResponse = await paymentProvider.initializePayment({
                amount: totalAmountInput,
                currency: requestDetails.currency,
                description: `Transfert KoraLink vers ${requestDetails.recipientNumber}`,
                customerName: userProfile.full_name || 'Client KoraLink',
                customerEmail: userProfile.email,
                customerPhone: requestDetails.recipientNumber,
                referenceId: transaction.id,
                successUrl: `${baseUrl}/dashboard/transfer/success?ref=${transaction.id}`,
                cancelUrl: `${baseUrl}/dashboard/transfer?error=cancelled`
            })

            if (!providerResponse.success) {
                await supabase.from('transactions').update({ status: 'failed' }).eq('id', transaction.id)
                throw new Error(providerResponse.errorMessage || 'Impossible d\'initialiser le paiement.')
            }

            // Update transaction with provider payment ID
            await supabase
                .from('transactions')
                .update({ moneroo_transaction_id: providerResponse.providerTransactionId })
                .eq('id', transaction.id)

            // 5. Audit Logging
            await supabase.from('audit_logs').insert({
                user_id: userId,
                action: 'INITIATE_PAYMENT',
                entity_id: transaction.id,
                entity_type: 'transaction',
                details: { amount: totalAmountInput, provider_id: providerResponse.providerTransactionId },
                ip_address: ipAddress
            })

            return {
                success: true,
                transactionId: transaction.id,
                checkoutUrl: providerResponse.checkoutUrl // Return this to frontend for redirect
            }

        } catch (error: any) {
            // Audit Logging - Failure
            await supabase.from('audit_logs').insert({
                user_id: userId,
                action: 'INITIATE_TRANSFER_FAILED',
                details: { error: error.message },
                ip_address: ipAddress
            })

            return {
                success: false,
                error: error.message
            }
        }
    }

    static async handleWebhook(payload: any) {
        const supabase = await createClient()
        const event = paymentProvider.parseWebhookEvent(payload)

        // Find the transaction by Moneroo ID OR internal referenceId (stored in metadata)
        const referenceId = payload.data?.metadata?.reference_id || event.providerTransactionId

        const { data: transaction, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('id', referenceId)
            .single()

        if (error || !transaction) {
            console.error('[TransferController] Transaction not found for webhook:', referenceId)
            return
        }

        if (event.type === 'payment' && event.status === 'success') {
            if (transaction.status !== 'awaiting_payment') return // Already processed

            // 1. Update status to 'payout_pending'
            await supabase.from('transactions').update({ status: 'payout_pending' }).eq('id', transaction.id)

            // 2. Trigger REAL Payout
            const payoutResult = await paymentProvider.initializeTransfer({
                amount: transaction.amount_received,
                currency: transaction.currency_received,
                senderCurrency: transaction.currency_sent,
                recipientNumber: transaction.recipient_number,
                recipientName: transaction.recipient_name,
                senderCountry: transaction.sender_country,
                receiverCountry: transaction.receiver_country,
                referenceId: transaction.id,
                payoutMethod: transaction.payout_method || 'orange_ci' // Default or fallback
            })

            if (payoutResult.success) {
                await supabase.from('transactions').update({
                    status: 'pending', // Now pending on provider's side
                    moneroo_payout_id: payoutResult.providerTransactionId
                }).eq('id', transaction.id)
            } else {
                await supabase.from('transactions').update({ status: 'failed' }).eq('id', transaction.id)
            }
        }

        if (event.type === 'payout' && event.status === 'success') {
            await supabase.from('transactions').update({ status: 'success' }).eq('id', transaction.id)
        }

        if (event.status === 'failed') {
            await supabase.from('transactions').update({ status: 'failed' }).eq('id', transaction.id)
        }
    }
}
