import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json()
        const { userId, action } = body

        if (!userId || !action) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        if (!['ban', 'unban'].includes(action)) {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
        }

        const isBanned = action === 'ban'

        // Use service role to bypass RLS and update user profile
        const supabaseAdmin = createAdminClient()

        const { error } = await supabaseAdmin
            .from('users')
            .update({ is_banned: isBanned })
            .eq('id', userId)

        if (error) {
            console.error('Failed to update user ban status:', error)
            return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
        }

        // Log the admin action
        await supabaseAdmin.from('audit_logs').insert({
            user_id: 'SYSTEM_ADMIN',
            action: isBanned ? 'ADMIN_BAN_USER' : 'ADMIN_UNBAN_USER',
            entity_id: userId,
            entity_type: 'user',
            details: { action_taken: action }
        })

        return NextResponse.json({ success: true, isBanned })

    } catch (error: any) {
        console.error('Admin API error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
