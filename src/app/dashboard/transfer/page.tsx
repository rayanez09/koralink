'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createClient } from '@/lib/supabase/client'

const APP_FEE_PERCENTAGE = 0.6
import { AFRICAN_COUNTRIES, countryPrefixes, countryPlaceholders, countryPayoutMethods } from '@/lib/countries'

export default function TransferPage() {
    const router = useRouter()
    const supabase = createClient()
    const [amount, setAmount] = useState<number | ''>('')
    const [senderCountry, setSenderCountry] = useState('sn')
    const [receiverCountry, setReceiverCountry] = useState('ci')
    const [recipientName, setRecipientName] = useState('')
    const [recipientNumber, setRecipientNumber] = useState('')
    const [payoutMethod, setPayoutMethod] = useState(countryPayoutMethods['ci']?.[0]?.id || '')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isSenderLocked, setIsSenderLocked] = useState(false)

    const [exchangeRate, setExchangeRate] = useState(1)
    const [isFetchingRate, setIsFetchingRate] = useState(false)

    // Security PIN Modal states
    const [showPinModal, setShowPinModal] = useState(false)
    const [securityPin, setSecurityPin] = useState('')
    const [pinError, setPinError] = useState<string | null>(null)

    // Identité des devises dynamiques
    const currencySent = AFRICAN_COUNTRIES.find(c => c.code === senderCountry)?.currency || 'XOF'
    const targetCurrency = AFRICAN_COUNTRIES.find(c => c.code === receiverCountry)?.currency || 'XOF'
    const senderFlag = AFRICAN_COUNTRIES.find(c => c.code === senderCountry)?.flag || ''
    const receiverFlag = AFRICAN_COUNTRIES.find(c => c.code === receiverCountry)?.flag || ''

    // Auto-détection du pays de l'expéditeur depuis le profil Supabase
    useEffect(() => {
        const fetchUserCountry = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return
            const countryCode = user.user_metadata?.country
            if (countryCode) {
                const exists = AFRICAN_COUNTRIES.find(c => c.code === countryCode)
                if (exists) {
                    setSenderCountry(countryCode)
                    setIsSenderLocked(true)
                }
            }
        }
        fetchUserCountry()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (currencySent === targetCurrency) {
            setExchangeRate(1)
            return
        }

        const fetchRate = async () => {
            setIsFetchingRate(true)
            try {
                // Fetch rate between Currencies
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

    // Auto-update prefix and defaults limits/methods on receiver country change
    const handleReceiverChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newCountry = e.target.value
        setReceiverCountry(newCountry)

        const availableMethods = countryPayoutMethods[newCountry]
        if (availableMethods && availableMethods.length > 0) {
            setPayoutMethod(availableMethods[0].id)
        } else {
            setPayoutMethod('bank_transfer')
        }
    }

    // Calculations
    const amountNum = Number(amount) || 0
    const appFee = amountNum * (APP_FEE_PERCENTAGE / 100)
    const netAmountSent = amountNum - appFee
    const amountReceived = netAmountSent * exchangeRate

    const handleTransfer = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (amountReceived <= 0) {
            setError('Le montant est trop faible.')
            return
        }

        // Show PIN Modal instead of directly executing
        setShowPinModal(true)
        setSecurityPin('')
        setPinError(null)
    }

    const executeTransferWithPin = async () => {
        setIsLoading(true)
        setPinError(null)

        try {
            const response = await fetch('/api/transfer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: amountNum,
                    currency: currencySent,
                    recipientName,
                    recipientNumber: `${countryPrefixes[receiverCountry] || ''}${recipientNumber}`,
                    senderCountry: senderCountry.toUpperCase(),
                    receiverCountry: receiverCountry.toUpperCase(),
                    payoutMethod,
                    securityPin: securityPin // We send the pin to be verified by backend
                })
            })

            const data = await response.json()

            if (!response.ok) {
                // If it's specifically a PIN error, we keep the modal open
                if (data.error && data.error.includes('PIN')) {
                    setPinError(data.error)
                    setIsLoading(false)
                    return
                }
                throw new Error(data.error || 'Transfer failed')
            }

            setShowPinModal(false)
            router.push('/dashboard')
            router.refresh()
        } catch (err: any) {
            setError(err.message)
            setShowPinModal(false)
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

                    {/* Country Selectors - New Design with Flags */}
                    <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-100">
                        <div className="flex items-center gap-3">
                            {/* Sender */}
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-zinc-500 font-medium mb-1.5">Depuis</p>
                                {isSenderLocked ? (
                                    <div className="flex items-center gap-2 h-11 px-3 rounded-lg bg-white border border-zinc-200">
                                        <span className="text-2xl">{senderFlag}</span>
                                        <div>
                                            <p className="text-sm font-bold text-zinc-900 leading-none">{currencySent}</p>
                                            <p className="text-xs text-zinc-500">{AFRICAN_COUNTRIES.find(c => c.code === senderCountry)?.name}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xl pointer-events-none">{senderFlag}</span>
                                        <select
                                            value={senderCountry}
                                            onChange={e => setSenderCountry(e.target.value)}
                                            className="h-11 w-full rounded-lg border border-zinc-300 bg-white pl-10 pr-3 text-sm font-semibold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                                        >
                                            {AFRICAN_COUNTRIES.map(country => (
                                                <option key={`sender-${country.code}`} value={country.code}>
                                                    {country.flag} {country.name} ({country.currency})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>

                            {/* Arrow */}
                            <div className="flex-shrink-0 mt-5">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </div>
                            </div>

                            {/* Receiver */}
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-zinc-500 font-medium mb-1.5">Vers</p>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xl pointer-events-none">{receiverFlag}</span>
                                    <select
                                        value={receiverCountry}
                                        onChange={handleReceiverChange}
                                        className="h-11 w-full rounded-lg border border-zinc-300 bg-white pl-10 pr-3 text-sm font-semibold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                                    >
                                        {AFRICAN_COUNTRIES.map(country => (
                                            <option key={`receiver-${country.code}`} value={country.code}>
                                                {country.flag} {country.name} ({country.currency})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Exchange Rate Display */}
                        <div className="mt-3 flex items-center gap-2">
                            {isFetchingRate ? (
                                <span className="text-xs text-blue-500 animate-pulse font-medium">Actualisation du taux...</span>
                            ) : (
                                <span className="text-xs font-semibold text-emerald-600">
                                    {senderFlag} 1 {currencySent} = {receiverFlag} {exchangeRate.toFixed(4)} {targetCurrency}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-zinc-900">Méthode de réception</label>
                        <select
                            value={payoutMethod}
                            onChange={(e) => setPayoutMethod(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-zinc-400 bg-transparent px-3 py-2 text-sm font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                        >
                            {(countryPayoutMethods[receiverCountry] || []).map(method => (
                                <option key={method.id} value={method.id}>
                                    {method.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-zinc-900">Nom du Bénéficiaire</label>
                            <Input
                                type="text"
                                placeholder="ex. Jean Dupont"
                                value={recipientName}
                                onChange={(e) => setRecipientName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-zinc-900">Numéro du Bénéficiaire</label>
                            <div className="flex rounded-md border border-zinc-400 bg-transparent focus-within:ring-2 focus-within:ring-blue-600 focus-within:border-transparent overflow-hidden">
                                <div className="flex items-center justify-center px-3 bg-zinc-100 border-r border-zinc-400 text-sm font-medium text-zinc-700 select-none">
                                    {countryPrefixes[receiverCountry] || '+'}
                                </div>
                                <Input
                                    type="tel"
                                    placeholder={countryPlaceholders[receiverCountry] || "01 02 03 04 05"}
                                    maxLength={countryPlaceholders[receiverCountry]?.replace(/ /g, '').length || 15}
                                    value={recipientNumber}
                                    onChange={(e) => setRecipientNumber(e.target.value)}
                                    required
                                    className="border-0 focus:ring-0 focus:border-0 rounded-none h-10 px-3 w-full"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-zinc-900">Total à Payer ({currencySent})</label>
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
                            isLoading={isLoading && !showPinModal}
                            disabled={amountReceived <= 0}
                        >
                            Payer {amountNum.toFixed(2)} {currencySent}
                        </Button>
                        <p className="text-center text-xs text-zinc-400 mt-4">
                            En confirmant, vous acceptez nos conditions d'utilisation et nos limites. <br />
                            Aucun frais caché.
                        </p>
                    </div>
                </form>
            </div>

            {/* PIN Security Modal */}
            {showPinModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200">
                        <div className="text-center mb-6">
                            <div className="mx-auto w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-zinc-900">Code de sécurité</h3>
                            <p className="text-sm text-zinc-500 mt-1">Veuillez entrer votre Code PIN à 4 chiffres pour autoriser l'envoi de {amountNum} {currencySent}.</p>
                        </div>

                        {pinError && (
                            <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm font-medium rounded-lg text-center">
                                {pinError}
                            </div>
                        )}

                        <div className="space-y-4">
                            <Input
                                type="password"
                                inputMode="numeric"
                                pattern="\d{4}"
                                maxLength={4}
                                placeholder="••••"
                                value={securityPin}
                                onChange={e => setSecurityPin(e.target.value.replace(/\D/g, ''))}
                                className="text-center text-3xl font-mono tracking-[0.5em] h-14"
                                autoFocus
                            />

                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <Button
                                    variant="secondary"
                                    onClick={() => setShowPinModal(false)}
                                    disabled={isLoading}
                                >
                                    Annuler
                                </Button>
                                <Button
                                    onClick={executeTransferWithPin}
                                    disabled={securityPin.length !== 4}
                                    isLoading={isLoading}
                                >
                                    Valider
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
