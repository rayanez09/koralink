import { NextRequest, NextResponse } from 'next/server'
import { paymentProvider } from '@/services/moneroo.service'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
    const payload = await req.text()
    const signature = req.headers.get('x-moneroo-signature') || ''

    // 1. Verify signature
    if (!paymentProvider.verifyWebhookSignature(payload, signature)) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    try {
        const jsonPayload = JSON.parse(payload)
        const event = paymentProvider.parseWebhookEvent(jsonPayload)

        // 2. Database update
        // We need service role for admin tasks like updating any transaction without RLS context for webhook
        const supabaseAdmin = createAdminClient()

        const { data: transaction, error: fetchError } = await supabaseAdmin
            .from('transactions')
            .select('id, user_id, status')
            .eq('moneroo_transaction_id', event.providerTransactionId)
            .single()

        if (fetchError || !transaction) {
            // Log anomaly
            console.error('Webhook: Transaction not found for provider ID', event.providerTransactionId)
            return NextResponse.json({ status: 'ignored', reason: 'Transaction not found' })
        }

        if (transaction.status !== event.status && transaction.status === 'pending') {
            await supabaseAdmin
                .from('transactions')
                .update({ status: event.status })
                .eq('id', transaction.id)

            // 3. Audit Logging
            await supabaseAdmin.from('audit_logs').insert({
                user_id: transaction.user_id,
                action: 'WEBHOOK_STATUS_UPDATE',
                entity_id: transaction.id,
                entity_type: 'transaction',
                details: { newStatus: event.status, providerTransactionId: event.providerTransactionId },
                ip_address: req.headers.get('x-forwarded-for') || 'webhook'
            })

            // 4. Create Notification
            await supabaseAdmin.from('notifications').insert({
                user_id: transaction.user_id,
                title: `Transfer ${event.status}`,
                message: `Your transfer of status updated to ${event.status}.`,
            })
        }

        return NextResponse.json({ received: true })
    } catch (error) {
        console.error('Webhook error:', error)
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
    }
}
