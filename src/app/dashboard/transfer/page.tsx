'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const APP_FEE_PERCENTAGE = 0.5
const MONEROO_FIXED_FEE = 0.01

export default function TransferPage() {
    const router = useRouter()
    const [amount, setAmount] = useState<number | ''>('')
    const [senderCountry, setSenderCountry] = useState('SN')
    const [receiverCountry, setReceiverCountry] = useState('CI')
    const [recipientNumber, setRecipientNumber] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Calculations
    const amountNum = Number(amount) || 0
    const appFee = amountNum * (APP_FEE_PERCENTAGE / 100)
    const totalFee = appFee + MONEROO_FIXED_FEE
    const amountReceived = Math.max(0, amountNum - totalFee)

    const handleTransfer = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        if (amountReceived <= 0) {
            setError('Amount is too low to cover fees.')
            setIsLoading(false)
            return
        }

        try {
            const response = await fetch('/api/transfer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: amountNum,
                    currency: 'XOF', // Fixed for MVP simplicity
                    recipientNumber,
                    senderCountry,
                    receiverCountry,
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
                <h1 className="text-2xl font-bold text-zinc-900">Send Money</h1>
                <p className="text-zinc-500">Initiate a secure international transfer.</p>
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
                            <label className="text-sm font-medium text-zinc-700">From</label>
                            <select
                                value={senderCountry}
                                onChange={e => setSenderCountry(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                            >
                                <option value="SN">Senegal (XOF)</option>
                                <option value="CI">Côte d'Ivoire (XOF)</option>
                                <option value="ML">Mali (XOF)</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-zinc-700">To</label>
                            <select
                                value={receiverCountry}
                                onChange={e => setReceiverCountry(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                            >
                                <option value="CI">Côte d'Ivoire (XOF)</option>
                                <option value="SN">Senegal (XOF)</option>
                                <option value="TG">Togo (XOF)</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-zinc-700">Recipient Phone Number</label>
                        <Input
                            type="text"
                            placeholder="+225 01 02 03 04 05"
                            value={recipientNumber}
                            onChange={(e) => setRecipientNumber(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-zinc-700">Amount to Send (XOF)</label>
                        <Input
                            type="number"
                            placeholder="0.00"
                            min="1"
                            step="0.01"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                            required
                            className="text-lg font-mono font-medium"
                        />
                    </div>

                    <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-5 space-y-3">
                        <div className="flex justify-between text-sm text-zinc-600">
                            <span>App Commission ({APP_FEE_PERCENTAGE}%)</span>
                            <span>- ${appFee.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-zinc-600">
                            <span>Network Fee</span>
                            <span>- ${MONEROO_FIXED_FEE.toFixed(2)}</span>
                        </div>
                        <div className="h-px bg-zinc-200 w-full my-2"></div>
                        <div className="flex justify-between font-bold text-zinc-900 text-lg">
                            <span>Net Amount Received</span>
                            <span className={amountReceived <= 0 ? 'text-red-500' : 'text-emerald-600'}>
                                ${amountReceived.toFixed(2)}
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
                            Confirm Transfer
                        </Button>
                        <p className="text-center text-xs text-zinc-400 mt-4">
                            By confirming, you agree to our terms of service and limits policy.
                            Transactions are processed securely via Moneroo.
                        </p>
                    </div>
                </form>
            </div>
        </div>
    )
}
