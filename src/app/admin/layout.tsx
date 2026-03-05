import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LogoutButton } from '@/components/ui/LogoutButton'

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

    if (userData?.role !== 'admin' && userData?.role !== 'super_admin') {
        redirect('/dashboard')
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <header className="bg-slate-900 text-white sticky top-0 z-10 w-full h-16 flex items-center justify-between px-6 shadow-md">
                <div className="flex items-center gap-8">
                    <Link href="/admin" className="text-xl font-bold tracking-tight">
                        KoraLink <span className="font-light text-slate-400">Admin</span>
                    </Link>
                    <nav className="flex items-center gap-4 text-sm font-medium">
                        <Link href="/admin" className="text-slate-300 hover:text-white transition-colors">Transactions</Link>
                        <Link href="/admin/users" className="text-slate-300 hover:text-white transition-colors">Utilisateurs</Link>
                    </nav>
                </div>
                <div className="flex items-center gap-6">
                    <Link href="/dashboard" className="text-sm text-slate-300 hover:text-white transition-colors">
                        Retour à l'application
                    </Link>
                    <div className="pl-4 border-l border-slate-700">
                        <LogoutButton className="text-slate-300 hover:text-red-400" />
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
                {children}
            </main>
        </div>
    )
}
