import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json()
        const { transactionId, status } = body

        if (!transactionId || !status) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        if (!['success', 'failed', 'canceled'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
        }

        // Use service role to bypass RLS and update transaction
        const supabaseAdmin = createAdminClient()

        const { error } = await supabaseAdmin
            .from('transactions')
            .update({ status })
            .eq('id', transactionId)

        if (error) {
            console.error('Failed to update transaction status:', error)
            return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
        }

        // Log the admin action
        await supabaseAdmin.from('audit_logs').insert({
            user_id: 'SYSTEM_ADMIN', // En vrai, récupérer l'ID de l'admin connecté
            action: `ADMIN_FORCE_${status.toUpperCase()}`,
            entity_id: transactionId,
            entity_type: 'transaction',
            details: { previousStatus: 'pending', newStatus: status }
        })

        return NextResponse.json({ success: true })

    } catch (error: any) {
        console.error('Admin API error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
