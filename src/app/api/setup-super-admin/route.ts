import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams
        const email = searchParams.get('email')

        if (!email) {
            return NextResponse.json({ error: 'Please provide an email query parameter ?email=votre@email.com' }, { status: 400 })
        }

        const supabaseAdmin = createAdminClient()

        // 0. FIX DATABASE CONSTRAINT FIRST
        // Since we are bypassing the Supabase SQL editor due to user issues,
        // we can execute a raw SQL RPC or just fix it if they have RPC access.
        // However, standard Supabase JS client doesn't allow raw SQL without an RPC function.
        // Let's try to do it by hoping they can run the SQL script, or we guide them.

        // 1. Chercher l'utilisateur avec cet email
        const { data: user, error: fetchError } = await supabaseAdmin
            .from('users')
            .select('id, email, role')
            .eq('email', email)
            .single()

        if (fetchError || !user) {
            return NextResponse.json({ error: 'User not found in public.users table' }, { status: 404 })
        }

        // 2. Mettre à jour son rôle en super_admin
        const { error: updateError } = await supabaseAdmin
            .from('users')
            .update({ role: 'super_admin' })
            .eq('id', user.id)

        if (updateError) {
            // If this fails, it's 100% the CHECK constraint.
            return NextResponse.json({
                error: 'Database Constraint Error',
                message: "La base de données refuse 'super_admin' car une règle stricte l'interdit.",
                fix_action: "Exécutez le script SQL 'migration_05_super_admin.sql' dans Supabase pour lever cette règle.",
                technical_details: updateError
            }, { status: 500 })
        }

        // 3. Log l'action
        await supabaseAdmin.from('audit_logs').insert({
            user_id: user.id,
            action: 'SYSTEM_INIT_SUPER_ADMIN',
            entity_id: user.id,
            entity_type: 'user',
            details: { action_taken: 'Manual override via setup route' }
        })

        return NextResponse.json({
            success: true,
            message: `User ${email} has been successfully promoted to super_admin!`,
            instructions: "You can now log in and access the /admin dashboard."
        })

    } catch (error: any) {
        console.error('Setup Super Admin API error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
