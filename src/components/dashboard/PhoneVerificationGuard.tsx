'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function PhoneVerificationGuard({ isVerified }: { isVerified: boolean }) {
    const [isOpen, setIsOpen] = useState(!isVerified)
    const [otp, setOtp] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [successMsg, setSuccessMsg] = useState<string | null>(null)
    const router = useRouter()

    if (!isOpen) return null

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setIsLoading(true)

        try {
            // Simulation d'une validation d'OTP fixe "1234" (à remplacer par vrai service SMS)
            if (otp !== '1234') {
                throw new Error("Code OTP incorrect. (Astuce: utilisez 1234)")
            }

            const res = await fetch('/api/user/verify-phone', { method: 'POST' })
            const data = await res.json()

            if (!res.ok) throw new Error(data.error || "Erreur serveur")

            setSuccessMsg("Numéro de téléphone vérifié avec succès !")

            // On ferme le modal après 2 secondes
            setTimeout(() => {
                setIsOpen(false)
                router.refresh() // Rafraîchit les données du cache Serveur
            }, 2000)

        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 sm:p-8 animate-in zoom-in-95 duration-200 relative overflow-hidden">
                <div className="text-center mb-6">
                    <div className="mx-auto w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-zinc-900">Vérification Requise</h3>
                    <p className="text-sm text-zinc-600 mt-2">
                        Pour des raisons de sécurité, vous devez vérifier votre numéro de téléphone avant de pouvoir effectuer des transferts sur KoraLink.
                    </p>
                </div>

                {successMsg ? (
                    <div className="p-4 bg-emerald-50 text-emerald-700 text-center font-medium rounded-xl border border-emerald-100 flex flex-col items-center gap-2">
                        <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {successMsg}
                    </div>
                ) : (
                    <form onSubmit={handleVerify} className="space-y-6">
                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg text-center border border-red-100">
                                {error}
                            </div>
                        )}

                        <div className="space-y-3">
                            <label className="text-sm font-semibold text-zinc-900 text-center block">
                                Entrez le code à 4 chiffres reçu par SMS
                            </label>
                            <Input
                                type="text"
                                inputMode="numeric"
                                pattern="\d{4}"
                                maxLength={4}
                                placeholder="••••"
                                value={otp}
                                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                                className="text-center text-4xl font-mono tracking-[0.5em] h-16 w-full max-w-[240px] mx-auto border-2 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                                autoFocus
                            />
                            <p className="text-xs text-center text-zinc-400 mt-2">
                                Simulation : un SMS contenant le code d'activation aurait été envoyé à votre numéro.
                            </p>
                        </div>

                        <Button
                            type="submit"
                            className="w-full text-lg h-12"
                            disabled={otp.length !== 4}
                            isLoading={isLoading}
                        >
                            Valider et continuer
                        </Button>
                    </form>
                )}
            </div>
        </div>
    )
}
