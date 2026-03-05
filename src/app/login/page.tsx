'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import Link from 'next/link'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            setError(error.message)
            setIsLoading(false)
        } else {
            // Check user role for routing
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                const { data: profile } = await supabase
                    .from('users')
                    .select('role')
                    .eq('id', user.id)
                    .single()

                if (profile && (profile.role === 'admin' || profile.role === 'super_admin')) {
                    router.push('/admin')
                } else {
                    router.push('/dashboard')
                }
            } else {
                router.push('/dashboard')
            }
            router.refresh()
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-zinc-100 p-8">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block">
                        <h1 className="text-3xl font-bold tracking-tight text-blue-900 mb-2">
                            Kora<span className="text-blue-600">Link</span>
                        </h1>
                    </Link>
                    <p className="text-sm text-zinc-500">Heureux de vous revoir. Saisissez vos accès.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md mb-4 border border-red-100">
                            {error}
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-zinc-700">E-mail</label>
                        <Input
                            type="email"
                            placeholder="votre@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-zinc-700">Mot de passe</label>
                        <Input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <Button type="submit" className="w-full mt-6" isLoading={isLoading}>
                        Se Connecter
                    </Button>

                    <p className="text-center text-sm text-zinc-600 mt-6">
                        Vous n'avez pas de compte ?{' '}
                        <Link href="/register" className="font-semibold text-blue-600 hover:underline">
                            S'inscrire
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    )
}
