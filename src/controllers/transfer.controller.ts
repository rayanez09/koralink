import { createClient } from '@/lib/supabase/server'
import { paymentProvider } from '@/services/moneroo.service'

interface TransferRequest {
    senderCountry: string
    receiverCountry: string
    amount: number
    currency: string
    recipientName: string
    recipientNumber: string
}

// Removed MOCK_EXCHANGE_RATES

export class TransferController {
    static async handleTransfer(userId: string, requestDetails: TransferRequest, ipAddress: string) {
        const supabase = await createClient()

        try {
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

            // 2. Check Limits (Daily / Monthly)
            // We would query the transactions table for pending and success transactions in current day/month.
            const now = new Date()
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

            const { data: dailyStats, error: dError } = await supabase
                .from('transactions')
                .select('amount_sent')
                .eq('user_id', userId)
                .gte('created_at', startOfDay)

            if (dError) throw new Error('Error checking daily limits')

            const dailyTotal = dailyStats.reduce((sum, t) => sum + t.amount_sent, 0)
            // Limit is based on total spent
            if (dailyTotal + totalAmountInput > dailyLimit) {
                throw new Error(`Daily limit exceeded. You can only send $${dailyLimit} per day.`)
            }

            const { data: monthlyStats, error: mError } = await supabase
                .from('transactions')
                .select('amount_sent')
                .eq('user_id', userId)
                .gte('created_at', startOfMonth)

            if (mError) throw new Error('Error checking monthly limits')

            const monthlyTotal = monthlyStats.reduce((sum, t) => sum + t.amount_sent, 0)
            if (monthlyTotal + totalAmountInput > monthlyLimit) {
                throw new Error(`Monthly limit exceeded. You can only send $${monthlyLimit} per month.`)
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
                referenceId: transaction.id
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
