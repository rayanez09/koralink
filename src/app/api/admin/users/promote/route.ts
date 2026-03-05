import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { userId } = body

        if (!userId) {
            return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
        }

        const supabaseClient = await createClient()
        const supabaseAdmin = createAdminClient()

        // 1. Verify caller is super_admin
        const { data: { user } } = await supabaseClient.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: callerProfile } = await supabaseAdmin
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()

        if (callerProfile?.role !== 'super_admin') {
            return NextResponse.json({ error: 'Forbidden. Only super admins can promote.' }, { status: 403 })
        }

        // 2. Prevent promoting oneself (if already super_admin somehow)
        if (userId === user.id) {
            return NextResponse.json({ error: 'Cannot promote yourself' }, { status: 400 })
        }

        // 3. Update the user role to 'admin' using the service role client
        const { error } = await supabaseAdmin
            .from('users')
            .update({ role: 'admin' })
            .eq('id', userId)

        if (error) {
            console.error('Failed to promote user:', error)
            return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
        }

        // 4. Log the action
        await supabaseAdmin.from('audit_logs').insert({
            user_id: user.id, // Acteur du log
            action: 'ADMIN_PROMOTED_USER',
            entity_id: userId,
            entity_type: 'user',
            details: { action_taken: 'Promoted to admin' }
        })

        return NextResponse.json({ success: true })

    } catch (error: any) {
        console.error('Promote Admin API error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
