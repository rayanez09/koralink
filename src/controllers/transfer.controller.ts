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
                .select('transactions_pin, is_banned')
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

            // Fetch Real Exchange Rate
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

            // Calculate Fees with Defalcation Logic
            // The amount passed in requestDetails is the Total Charged to user.
            const totalAmountInput = requestDetails.amount
            const appFee = totalAmountInput * (appFeePercentage / 100)
            const netAmountSent = totalAmountInput - appFee // We deduct the fee to find the converted capital

            const totalFee = appFee
            const amountReceived = netAmountSent * exchangeRate

            if (amountReceived <= 0 || netAmountSent <= 0) {
                throw new Error('Transfer amount is too low to cover fees.')
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

            const now = new Date()
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

            const { data: dailyStats, error: dError } = await supabase
                .from('transactions')
                .select('amount_sent, currency_sent')
                .eq('user_id', userId)
                .gte('created_at', startOfDay)

            if (dError) throw new Error('Erreur lors de la vérification des limites.')

            const dailyTotalUSD = dailyStats.reduce((sum, t) => sum + getAmountInUSD(t.amount_sent, t.currency_sent), 0)
            const currentTransferUSD = getAmountInUSD(totalAmountInput, requestDetails.currency)

            // Limit is based on total spent in USD equivalent
            if (dailyTotalUSD + currentTransferUSD > dailyLimit) {
                throw new Error(`Limite quotidienne dépassée. Vous ne pouvez envoyer que l'équivalent de $${dailyLimit} USD par jour.`)
            }

            const { data: monthlyStats, error: mError } = await supabase
                .from('transactions')
                .select('amount_sent, currency_sent')
                .eq('user_id', userId)
                .gte('created_at', startOfMonth)

            if (mError) throw new Error('Erreur lors de la vérification des limites.')

            const monthlyTotalUSD = monthlyStats.reduce((sum, t) => sum + getAmountInUSD(t.amount_sent, t.currency_sent), 0)
            if (monthlyTotalUSD + currentTransferUSD > monthlyLimit) {
                throw new Error(`Limite mensuelle dépassée. Vous ne pouvez envoyer que l'équivalent de $${monthlyLimit} USD par mois.`)
            }

            // 3. Create 'pending' transaction in DB
            const { data: transaction, error: insertError } = await supabase
                .from('transactions')
                .insert({
                    user_id: userId,
                    sender_country: requestDetails.senderCountry,
                    receiver_country: requestDetails.receiverCountry,
                    recipient_name: requestDetails.recipientName,
                    recipient_number: requestDetails.recipientNumber,
                    amount_sent: totalAmountInput, // we store the total intent as amount_sent for limit purpose
                    currency_sent: requestDetails.currency,
                    exchange_rate: exchangeRate,
                    amount_received: amountReceived,
                    currency_received: targetCurrency,
                    app_fee: appFee,
                    moneroo_fee: 0,
                    total_fee: totalFee,
                    status: 'pending'
                })
                .select()
                .single()

            if (insertError || !transaction) throw new Error('Failed to create pending transaction')

            // 4. Initialize transfer with abstract Payment Provider
            const providerResponse = await paymentProvider.initializeTransfer({
                amount: amountReceived,
                currency: requestDetails.currency,
                recipientNumber: requestDetails.recipientNumber,
                senderCountry: requestDetails.senderCountry,
                receiverCountry: requestDetails.receiverCountry,
                referenceId: transaction.id,
                payoutMethod: requestDetails.payoutMethod
            })

            if (!providerResponse.success) {
                // If provider fails immediately, update status to failed
                await supabase
                    .from('transactions')
                    .update({ status: 'failed' })
                    .eq('id', transaction.id)

                throw new Error(providerResponse.errorMessage || 'Provider rejected the transfer')
            }

            // Update transaction with provider ID
            await supabase
                .from('transactions')
                .update({ moneroo_transaction_id: providerResponse.providerTransactionId })
                .eq('id', transaction.id)

            // 5. Audit Logging - Success
            await supabase.from('audit_logs').insert({
                user_id: userId,
                action: 'INITIATE_TRANSFER',
                entity_id: transaction.id,
                entity_type: 'transaction',
                details: { amount: totalAmountInput, destination: requestDetails.recipientNumber },
                ip_address: ipAddress
            })

            return {
                success: true,
                transactionId: transaction.id,
                providerResponse
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
}
