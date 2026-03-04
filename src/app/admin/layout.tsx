import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Double check admin role, just in case middleware is bypassed somehow
    const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

    if (userData?.role !== 'admin') {
        redirect('/dashboard')
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <header className="bg-slate-900 text-white sticky top-0 z-10 w-full h-16 flex items-center justify-between px-6 shadow-md">
                <Link href="/admin" className="text-xl font-bold tracking-tight">
                    KoraLink <span className="font-light text-slate-400">Admin</span>
                </Link>
                <Link href="/dashboard" className="text-sm text-slate-300 hover:text-white transition-colors">
                    Exit to App
                </Link>
            </header>

            <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
                {children}
            </main>
        </div>
    )
}
