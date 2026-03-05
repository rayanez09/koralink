'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import Link from 'next/link'

import { AFRICAN_COUNTRIES, countryPrefixes, countryPlaceholders } from '@/lib/countries'

export default function RegisterPage() {
    const [fullName, setFullName] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [country, setCountry] = useState('ci')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [acceptedTerms, setAcceptedTerms] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setCountry(e.target.value)
        // Le prefix change visuellement via la constante, on ne touche plus à phoneNumber
    }

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!acceptedTerms) {
            setError("Vous devez accepter les conditions d'utilisation et de confidentialité pour créer un compte.")
            return
        }

        setIsLoading(true)
        setError(null)

        const { error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    phone_number: `${countryPrefixes[country] || ''}${phoneNumber}`,
                    country: country,
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
                            <label className="text-sm font-semibold text-zinc-900">Nom Complet</label>
                            <Input
                                type="text"
                                placeholder="ex. Jean Dupont"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-zinc-900">Pays de résidence</label>
                            <select
                                value={country}
                                onChange={handleCountryChange}
                                className="flex h-10 w-full rounded-md border border-zinc-400 bg-transparent px-3 py-2 text-sm font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                            >
                                {AFRICAN_COUNTRIES.map(c => (
                                    <option key={c.code} value={c.code}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-zinc-900">Numéro de Téléphone</label>
                            <div className="flex rounded-md border border-zinc-400 bg-transparent focus-within:ring-2 focus-within:ring-blue-600 focus-within:border-transparent overflow-hidden">
                                <div className="flex items-center justify-center px-3 bg-zinc-100 border-r border-zinc-400 text-sm font-medium text-zinc-700 select-none">
                                    {countryPrefixes[country] || '+'}
                                </div>
                                <Input
                                    type="tel"
                                    placeholder={countryPlaceholders[country] || "01 02 03 04 05"}
                                    maxLength={countryPlaceholders[country]?.replace(/ /g, '').length || 15}
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    required
                                    className="border-0 focus:ring-0 focus:border-0 rounded-none h-10 px-3 w-full"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-zinc-900">Adresse Email</label>
                            <Input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-zinc-900">Mot de passe</label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>

                        <div className="flex items-start gap-3 mt-4 bg-zinc-50 p-3 rounded-lg border border-zinc-200">
                            <div className="flex items-center h-5 mt-0.5">
                                <input
                                    id="terms"
                                    type="checkbox"
                                    checked={acceptedTerms}
                                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                                    className="w-4 h-4 text-blue-600 bg-white border-zinc-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                                />
                            </div>
                            <label htmlFor="terms" className="text-sm text-zinc-600 leading-snug cursor-pointer font-medium">
                                J'ai lu et j'accepte les{' '}
                                <Link target="_blank" href="/terms" className="text-blue-600 hover:text-blue-700 hover:underline font-semibold">
                                    conditions d'utilisation et de confidentialité
                                </Link>
                                {' '}de la plateforme KoraLink.
                            </label>
                        </div>

                        <Button type="submit" className="w-full mt-6" isLoading={isLoading} disabled={!acceptedTerms}>
                            Créer mon compte
                        </Button>

                        <p className="text-center text-sm text-zinc-600 mt-6">
                            Vous avez déjà un compte ?{' '}
                            <Link href="/login" className="font-semibold text-blue-600 hover:underline">
                                Se connecter
                            </Link>
                        </p>
                    </form>
                )}
            </div>
        </div>
    )
}
