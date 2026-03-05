'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function LogoutButton({ className = '' }: { className?: string }) {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleLogout = async () => {
        setIsLoading(true)
        try {
            await supabase.auth.signOut()
            router.push('/login')
            router.refresh()
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <button
            onClick={handleLogout}
            disabled={isLoading}
            className={`text-sm font-medium hover:opacity-80 transition-opacity flex items-center gap-2 ${className}`}
            title="Se déconnecter"
        >
            {isLoading ? (
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
            ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
            )}
            <span className="hidden sm:inline">Déconnexion</span>
        </button>
    )
}
