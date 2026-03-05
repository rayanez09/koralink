import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
    try {
        const supabase = await createClient()

        // 1. Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: "Non autorisé." }, { status: 401 })
        }

        // 2. Update the phone_verified status in public.users table
        const { error: updateError } = await supabase
            .from('users')
            .update({ phone_verified: true })
            .eq('id', user.id)

        if (updateError) {
            console.error("Erreur de mise à jour MSR:", updateError)
            return NextResponse.json({ error: "Impossible de valider le numéro en base." }, { status: 500 })
        }

        return NextResponse.json({ success: true })

    } catch (error: any) {
        console.error('Error verifying phone:', error)
        return NextResponse.json(
            { error: 'Une erreur serveur est survenue.' },
            { status: 500 }
        )
    }
}
