'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'

export function UserActions({ userId, isBanned }: { userId: string, isBanned: boolean }) {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const toggleBanStatus = async () => {
        setIsLoading(true)

        try {
            const response = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    action: isBanned ? 'unban' : 'ban'
                })
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to update user status')
            }

            router.refresh()
        } catch (error) {
            console.error(error)
            alert("Erreur lors de la modification du statut de l'utilisateur.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex items-center gap-2 justify-end">
            <Button
                variant={isBanned ? 'secondary' : 'danger'}
                className={`h-8 px-3 text-xs ${isBanned ? 'text-zinc-600' : 'text-white'}`}
                onClick={toggleBanStatus}
                disabled={isLoading}
            >
                {isLoading ? '...' : isBanned ? 'Débannir' : 'Bannir'}
            </Button>
        </div>
    )
}
