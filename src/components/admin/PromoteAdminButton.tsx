'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'

export function PromoteAdminButton({ userId }: { userId: string }) {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const promoteUser = async () => {
        if (!confirm("Voulez-vous vraiment nommer cet utilisateur en tant qu'Administrateur ? Cette action est irréversible ici.")) {
            return
        }

        setIsLoading(true)

        try {
            const response = await fetch('/api/admin/users/promote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to promote user')
            }

            router.refresh()
        } catch (error) {
            console.error(error)
            alert("Erreur lors de la nomination de l'utilisateur.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Button
            variant="ghost"
            onClick={promoteUser}
            disabled={isLoading}
            className="h-8 px-3 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-blue-200"
            title="Nommer cet utilisateur comme administrateur de la plateforme."
        >
            {isLoading ? '...' : '+ Nommer Admin'}
        </Button>
    )
}
