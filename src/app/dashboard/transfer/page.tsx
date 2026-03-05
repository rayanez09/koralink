'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const APP_FEE_PERCENTAGE = 0.6
const countryPrefixes: Record<string, string> = { 'sn': '+221', 'ci': '+225', 'gh': '+233' }

export default function TransferPage() {
    const router = useRouter()
    const [amount, setAmount] = useState<number | ''>('')
    const [senderCountry, setSenderCountry] = useState('sn')
    const [receiverCountry, setReceiverCountry] = useState('ci')
    const [recipientName, setRecipientName] = useState('')
    const [recipientNumber, setRecipientNumber] = useState('+225 ')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [exchangeRate, setExchangeRate] = useState(1)
    const [isFetchingRate, setIsFetchingRate] = useState(false)

    // Identité des devises
    const currencySent = senderCountry === 'gh' ? 'GHS' : 'XOF'
    const targetCurrency = receiverCountry === 'gh' ? 'GHS' : 'XOF'

    // Fetch rate
    useEffect(() => {
        if (currencySent === targetCurrency) {
            setExchangeRate(1)
            return
        }

        const fetchRate = async () => {
            setIsFetchingRate(true)
            try {
                const res = await fetch(`/api/rates?base=${currencySent}`)
                if (res.ok) {
                    const data = await res.json()
                    setExchangeRate(data.rates[targetCurrency] || 1)
                }
            } catch (error) {
                console.error('Failed to fetch rate:', error)
            } finally {
                setIsFetchingRate(false)
            }
        }
        fetchRate()
    }, [currencySent, targetCurrency])

    // Auto-update prefix
    const handleReceiverChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newCountry = e.target.value
        setReceiverCountry(newCountry)

        const prefix = countryPrefixes[newCountry] || ''
        const currentTrimmed = recipientNumber.trim()
        const isJustPrefix = Object.values(countryPrefixes).some(p => currentTrimmed === p) || currentTrimmed === ''

        if (isJustPrefix) {
            setRecipientNumber(prefix + ' ')
        }
    }

    // Calculations
    const amountNum = Number(amount) || 0
    const appFee = amountNum * (APP_FEE_PERCENTAGE / 100)
    const netAmountSent = amountNum - appFee
    const amountReceived = netAmountSent * exchangeRate

    const handleTransfer = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        if (amountReceived <= 0) {
            setError('Le montant est trop faible.')
            setIsLoading(false)
            return
        }

        try {
            const response = await fetch('/api/transfer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: amountNum,
                    currency: currencySent,
                    recipientName,
                    recipientNumber,
                    senderCountry: senderCountry.toUpperCase(),
                    receiverCountry: receiverCountry.toUpperCase(),
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Transfer failed')
            }

            router.push('/dashboard')
            router.refresh()
        } catch (err: any) {
            setError(err.message)
            setIsLoading(false)
        }
    }

    return (
        <div className="max-w-xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-zinc-900">Envoyer de l'argent</h1>
                <p className="text-zinc-500">Initiez un transfert international sécurisé.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-6 sm:p-8">
                <form onSubmit={handleTransfer} className="space-y-6">
                    {error && (
                        <div className="p-4 bg-red-50 text-red-700 border border-red-100 rounded-lg text-sm font-medium">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-zinc-700">Depuis</label>
                            <select
                                value={senderCountry}
                                onChange={e => setSenderCountry(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                            >
                                <option value="sn">Sénégal (XOF)</option>
                                <option value="ci">Côte d'Ivoire (XOF)</option>
                                <option value="gh">Ghana (GHS)</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-zinc-700">Vers</label>
                            <select
                                value={receiverCountry}
                                onChange={handleReceiverChange}
                                className="flex h-10 w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                            >
                                <option value="ci">Côte d'Ivoire (XOF)</option>
                                <option value="sn">Sénégal (XOF)</option>
                                <option value="gh">Ghana (GHS)</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-zinc-700">Nom du Bénéficiaire</label>
                            <Input
                                type="text"
                                placeholder="ex. Jean Dupont"
                                value={recipientName}
                                onChange={(e) => setRecipientName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-zinc-700">Numéro du Bénéficiaire</label>
                            <Input
                                type="text"
                                placeholder="+225 01 02 03 04 05"
                                value={recipientNumber}
                                onChange={(e) => setRecipientNumber(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-zinc-700">Total à Payer ({currencySent})</label>
                        <Input
                            type="number"
                            placeholder="0.00"
                            min="100"
                            step="0.01"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                            required
                            className="text-xl font-mono font-bold text-blue-700 border-blue-200 focus:border-blue-500 focus:ring-blue-500 bg-blue-50/50"
                        />
                        <p className="text-xs text-zinc-500">Montant total qui sera débité de votre compte.</p>
                    </div>

                    <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-5 space-y-3 relative overflow-hidden">
                        {isFetchingRate && (
                            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-10">
                                <div className="text-sm text-blue-600 font-medium animate-pulse">Actualisation du taux...</div>
                            </div>
                        )}
                        <div className="flex justify-between font-medium text-zinc-900 text-sm">
                            <span>Total Saisi</span>
                            <span>{amountNum.toFixed(2)} {currencySent}</span>
                        </div>
                        <div className="flex justify-between text-sm text-red-500">
                            <span>Frais de la plateforme ({APP_FEE_PERCENTAGE}%)</span>
                            <span>- {appFee.toFixed(2)} {currencySent}</span>
                        </div>

                        <div className="h-px bg-zinc-200 w-full my-4 relative">
                            <div className="absolute left-1/2 -top-2.5 -translate-x-1/2 bg-zinc-50 px-3 text-[10px] text-zinc-500 font-medium tracking-wide whitespace-nowrap">
                                Taux : 1 {currencySent} = {exchangeRate.toFixed(4)} {targetCurrency}
                            </div>
                        </div>

                        <div className="flex justify-between font-bold text-emerald-700 text-xl font-mono">
                            <span>Le bénéficiaire reçoit</span>
                            <span className={amountReceived <= 0 ? 'text-red-500' : ''}>
                                {amountReceived.toFixed(2)} {targetCurrency}
                            </span>
                        </div>
                    </div>

                    <div className="pt-2">
                        <Button
                            type="submit"
                            className="w-full text-lg h-12"
                            isLoading={isLoading}
                            disabled={amountReceived <= 0}
                        >
                            Confirmer le transfert
                        </Button>
                        <p className="text-center text-xs text-zinc-400 mt-4">
                            En confirmant, vous acceptez nos conditions d'utilisation et nos limites. <br />
                            Aucun frais caché.
                        </p>
                    </div>
                </form>
            </div>
        </div>
    )
}
