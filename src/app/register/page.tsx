'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import Link from 'next/link'

export default function RegisterPage() {
    const [fullName, setFullName] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        const { error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    phone_number: phoneNumber,
                },
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
        })

        if (signUpError) {
            setError(signUpError.message)
            setIsLoading(false)
        } else {
            setIsSuccess(true)
            setIsLoading(false)
            // Note: By default Supabase requires email confirmation.
            // If disabled in Supabase, the user is logged in automatically.
            router.push('/dashboard')
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
                    <p className="text-sm text-zinc-500">Créez un compte pour commencer à envoyer.</p>
                </div>

                {isSuccess ? (
                    <div className="text-center space-y-4">
                        <div className="p-4 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg text-sm">
                            Compte créé avec succès ! Si requis, validez votre e-mail.
                        </div>
                        <Link href="/login">
                            <Button className="w-full">Se Connecter</Button>
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleRegister} className="space-y-4">
                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md mb-4 border border-red-100">
                                {error}
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-zinc-700">Nom Complet</label>
                            <Input
                                type="text"
                                placeholder="ex. Jean Dupont"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-zinc-700">Numéro de Téléphone</label>
                            <Input
                                type="tel"
                                placeholder="+225 00000000"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-zinc-700">Email</label>
                            <Input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-zinc-700">Password</label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>

                        <Button type="submit" className="w-full mt-6" isLoading={isLoading}>
                            Create Account
                        </Button>

                        <p className="text-center text-sm text-zinc-600 mt-6">
                            Already have an account?{' '}
                            <Link href="/login" className="font-semibold text-blue-600 hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </form>
                )}
            </div>
        </div>
    )
}
