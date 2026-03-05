import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LogoutButton } from '@/components/ui/LogoutButton'
import { PhoneVerificationGuard } from '@/components/dashboard/PhoneVerificationGuard'

export default async function DashboardLayout({
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

    const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

    // Fetch full name or generate one from email
    const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'

    return (
        <div className="min-h-screen bg-zinc-50 flex flex-col">
            <header className="bg-white border-b border-zinc-200 sticky top-0 z-10 w-full h-16 flex items-center justify-between px-6">
                <Link href="/dashboard" className="text-xl font-bold tracking-tight text-blue-900">
                    Kora<span className="text-blue-600">Link</span>
                </Link>

                <div className="flex items-center gap-6 text-sm">
                    <nav className="hidden md:flex items-center gap-6 font-medium text-zinc-600">
                        <Link href="/dashboard" className="hover:text-blue-600 transition-colors">Aperçu</Link>
                        <Link href="/dashboard/transfer" className="hover:text-blue-600 transition-colors">Envoyer de l'argent</Link>
                        <Link href="/dashboard/profile" className="hover:text-blue-600 transition-colors">Mon Profil</Link>
                    </nav>

                    <div className="flex items-center gap-4 border-l border-zinc-200 pl-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                                {fullName.charAt(0).toUpperCase()}
                            </div>
                            <div className="hidden md:block text-zinc-800 font-medium">{fullName}</div>
                        </div>

                        <div className="pl-2 border-l border-zinc-100">
                            <LogoutButton className="text-zinc-500 hover:text-red-600" />
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
                <PhoneVerificationGuard
                    isVerified={userData?.role === 'super_admin' || (userData?.phone_verified ?? false)}
                />
                {children}
            </main>
        </div>
    )
}
