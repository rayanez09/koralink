'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'

interface Transaction {
    id: string
    status: string
}

export function TransactionActions({ transaction }: { transaction: Transaction }) {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const updateStatus = async (newStatus: 'success' | 'failed' | 'canceled') => {
        setIsLoading(true)

        try {
            // Dans une vraie application, on ferait un appel à une route API sécurisée (/api/admin/transaction)
            // pour que le serveur admin (Supabase Service Key) fasse la modification et logge l'action.
            // Pour le MVP V4, on fait une requête à une route que nous allons créer.

            const response = await fetch('/api/admin/transactions', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    transactionId: transaction.id,
                    status: newStatus
                })
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to update transaction status')
            }

            router.refresh()
        } catch (error) {
            console.error(error)
            alert("Erreur lors de la modification de la transaction.")
        } finally {
            setIsLoading(false)
        }
    }

    if (transaction.status === 'success' || transaction.status === 'canceled') {
        return <span className="text-zinc-400 text-xs italic">Terminée</span>
    }

    return (
        <div className="flex items-center gap-2 justify-end">
            <Button
                variant="ghost"
                className="h-8 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => updateStatus('failed')}
                disabled={isLoading}
            >
                Échec
            </Button>
            <Button
                variant="ghost"
                className="h-8 px-2 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                onClick={() => updateStatus('success')}
                disabled={isLoading}
            >
                Succès
            </Button>
        </div>
    )
}
