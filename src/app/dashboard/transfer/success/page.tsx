'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { CheckCircle2, ArrowRight, Loader2, Home } from 'lucide-react'

export default function SuccessPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const supabase = createClient()
    const ref = searchParams.get('ref')

    const [status, setStatus] = useState<'loading' | 'success' | 'processing' | 'failed'>('loading')
    const [transaction, setTransaction] = useState<any>(null)

    useEffect(() => {
        if (!ref) {
            setStatus('failed')
            return
        }

        const checkStatus = async () => {
            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .eq('id', ref)
                .single()

            if (error || !data) {
                setStatus('failed')
                return
            }

            setTransaction(data)

            // If status is still awaiting_payment, it means webhook hasn't fired yet
            if (data.status === 'awaiting_payment') {
                setStatus('processing')
            } else if (data.status === 'failed') {
                setStatus('failed')
            } else {
                setStatus('success')
            }
        }

        checkStatus()

        // Poll for status update if it's still processing
        const interval = setInterval(checkStatus, 3000)
        return () => clearInterval(interval)
    }, [ref, supabase])

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-zinc-100 p-8 text-center animate-in zoom-in-95 duration-500">

                {status === 'loading' && (
                    <div className="py-12 flex flex-col items-center">
                        <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-4" />
                        <h2 className="text-xl font-bold text-zinc-900">Vérification de votre paiement...</h2>
                    </div>
                )}

                {(status === 'success' || status === 'processing') && (
                    <>
                        <div className="mx-auto w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 animate-in fade-in zoom-in duration-700">
                            <CheckCircle2 className="w-12 h-12" />
                        </div>

                        <h1 className="text-3xl font-extrabold text-zinc-900 mb-2">Paiement Reçu !</h1>
                        <p className="text-zinc-600 mb-8">
                            {status === 'processing'
                                ? "Votre paiement est validé. Nous initions l'envoi vers le bénéficiaire..."
                                : "Votre transfert est en cours d'envoi. Le bénéficiaire le recevra d'ici quelques minutes."}
                        </p>

                        <div className="bg-zinc-50 rounded-2xl p-6 mb-8 text-left space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-500">Référence</span>
                                <span className="font-mono font-medium text-zinc-900">{ref?.substring(0, 8)}...</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-500">Montant envoyé</span>
                                <span className="font-bold text-zinc-900">{transaction?.amount_sent} {transaction?.currency_sent}</span>
                            </div>
                            <div className="flex justify-between text-sm pt-2 border-t border-zinc-200">
                                <span className="text-zinc-500">Le bénéficiaire reçoit</span>
                                <span className="font-bold text-emerald-600 text-lg">{transaction?.amount_received} {transaction?.currency_received}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            <Link href="/dashboard">
                                <Button className="w-full flex items-center justify-center gap-2 py-6 text-lg">
                                    <Home className="w-5 h-5" />
                                    Retour au tableau de bord
                                </Button>
                            </Link>
                        </div>
                    </>
                )}

                {status === 'failed' && (
                    <>
                        <div className="mx-auto w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
                            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-zinc-900 mb-2">Oups !</h1>
                        <p className="text-zinc-600 mb-8">Nous n'avons pas pu confirmer votre paiement ou une erreur est survenue.</p>
                        <Link href="/dashboard/transfer">
                            <Button variant="secondary" className="w-full">Réessayer le transfert</Button>
                        </Link>
                    </>
                )}
            </div>
        </div>
    )
}
