'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function ProfilePage() {
    const router = useRouter()
    const supabase = createClient()

    const [user, setUser] = useState<any>(null)
    const [profile, setProfile] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)

    // Form state
    const [fullName, setFullName] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [pin, setPin] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    useEffect(() => {
        async function loadProfile() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }

            setUser(user)

            const { data: userProfile } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single()

            if (userProfile) {
                setProfile(userProfile)
                setFullName(userProfile.full_name || '')
                setPhoneNumber(userProfile.phone_number || '')
            }
            setIsLoading(false)
        }

        loadProfile()
    }, [router, supabase])

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        setMessage(null)

        try {
            // Update Auth Meta (Optional but good practice)
            await supabase.auth.updateUser({
                data: { full_name: fullName, phone_number: phoneNumber }
            })

            // Update Public Profile and PIN
            const updates: any = {
                full_name: fullName,
                phone_number: phoneNumber,
            }

            // Si l'utilisateur a tapé un nouveau code PIN on le sauvegarde
            if (pin.length > 0) {
                if (pin.length !== 4 || !/^\d+$/.test(pin)) {
                    throw new Error("Le code PIN doit comporter exactement 4 chiffres.")
                }

                // Note : Pour un vrai système bancaire on ne stocke pas le PIN en clair. 
                // Pour notre MVP (Supabase), on le stocke dans le champ transactions_pin.
                updates.transactions_pin = pin
            }

            const { error } = await supabase
                .from('users')
                .update(updates)
                .eq('id', user.id)

            if (error) throw error

            setMessage({ type: 'success', text: 'Profil mis à jour avec succès.' })
            if (pin.length > 0) setPin('') // Reset PIN field after save

            // Refresh local profile state
            setProfile({ ...profile, ...updates })

        } catch (error: any) {
            setMessage({ type: 'error', text: error.message })
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) return <div className="p-8 text-center text-zinc-500 animate-pulse">Chargement de votre profil...</div>

    return (
        <div className="max-w-2xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-zinc-900">Mon Profil</h1>
                <p className="text-zinc-500">Gérez vos informations personnelles et votre sécurité.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-6 sm:p-8">
                {message && (
                    <div className={`p-4 mb-6 rounded-lg text-sm font-medium border ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSaveProfile} className="space-y-6">
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-zinc-800 border-b border-zinc-100 pb-2">Informations Générales</h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-zinc-700">Adresse Email</label>
                                <Input type="email" value={user?.email || ''} disabled className="bg-zinc-50 text-zinc-500" />
                                <p className="text-xs text-zinc-400">Pour modifier votre email, contactez le support.</p>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-zinc-700">Nom Complet</label>
                                <Input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required />
                            </div>

                            <div className="space-y-1 sm:col-span-2">
                                <label className="text-sm font-medium text-zinc-700">Numéro de Téléphone (Mobile Money)</label>
                                <Input type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} required />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4">
                        <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                            <h2 className="text-lg font-semibold text-zinc-800">Sécurité des Transferts</h2>
                            {profile?.transactions_pin && (
                                <span className="bg-emerald-100 text-emerald-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div> Code PIN Actif
                                </span>
                            )}
                        </div>

                        <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-zinc-700">
                                    {profile?.transactions_pin ? 'Modifier mon Code PIN (4 chiffres)' : 'Créer un Code PIN (4 chiffres)'}
                                </label>
                                <Input
                                    type="password"
                                    inputMode="numeric"
                                    pattern="\d{4}"
                                    maxLength={4}
                                    placeholder="••••"
                                    value={pin}
                                    onChange={e => setPin(e.target.value.replace(/\D/g, ''))} // N'accepte que des chiffres
                                    className="text-center text-xl tracking-[0.5em] font-mono max-w-[200px]"
                                />
                                <p className="text-xs text-zinc-500 mt-2">
                                    Ce code secret vous sera demandé pour valider chaque envoi d'argent depuis KoraLink. Laissez vide si vous ne souhaitez pas le changer.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <Button type="submit" isLoading={isSaving} className="w-full sm:w-auto">
                            Enregistrer les modifications
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
