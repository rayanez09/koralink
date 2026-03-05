import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { UserActions } from '@/components/admin/UserActions'
import { PromoteAdminButton } from '@/components/admin/PromoteAdminButton'

export default async function AdminUsersPage() {
    const supabaseAdmin = createAdminClient()
    const supabaseClient = await createClient()

    // Get current user to check if they are super_admin
    const { data: { user } } = await supabaseClient.auth.getUser()

    let isSuperAdmin = false
    if (user) {
        const { data: currentUserProfile } = await supabaseAdmin
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()

        isSuperAdmin = currentUserProfile?.role === 'super_admin'
    }

    // Fetch users securely via admin client
    const { data: users, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        return <div className="p-4 text-red-500">Failed to load users: {error.message}</div>
    }

    const totalUsers = users?.length || 0
    const bannedUsers = users?.filter(u => u.is_banned).length || 0
    const activeUsers = totalUsers - bannedUsers

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Utilisateurs</h1>
                <p className="text-slate-500">Gérez les comptes clients et la sécurité de la plateforme.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <p className="text-sm font-medium text-slate-500 mb-1">Total Utilisateurs</p>
                    <p className="text-2xl font-bold text-slate-900">{totalUsers}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <p className="text-sm font-medium text-slate-500 mb-1">Comptes Actifs</p>
                    <p className="text-2xl font-bold text-emerald-600">{activeUsers}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-red-500">
                    <p className="text-sm font-medium text-slate-500 mb-1">Comptes Bannis</p>
                    <p className="text-2xl font-bold text-red-600">{bannedUsers}</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                    <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Base Clients</h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-slate-500 font-medium">
                            <tr>
                                <th className="px-6 py-3">Client</th>
                                <th className="px-6 py-3">Inscription</th>
                                <th className="px-6 py-3">Téléphone</th>
                                <th className="px-6 py-3">Sécurité (PIN)</th>
                                <th className="px-6 py-3">Rôle / Statut</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {users?.map((usr) => (
                                <tr key={usr.id} className={`hover:bg-slate-50 ${usr.is_banned ? 'bg-red-50/30' : ''}`}>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-900">{usr.full_name || 'Non renseigné'}</div>
                                        <div className="text-slate-500 text-xs">{usr.email}</div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">
                                        {new Date(usr.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-slate-900 font-medium">
                                        {usr.phone_number || '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        {usr.transactions_pin ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-800">
                                                DÉFINI
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-100 text-zinc-600">
                                                NON DÉFINI
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 space-y-1">
                                        <div>
                                            {usr.role === 'super_admin' ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 border border-amber-300">SUPER ADMIN</span>
                                            ) : usr.role === 'admin' ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">ADMIN</span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">USER</span>
                                            )}
                                        </div>
                                        <div>
                                            {usr.is_banned && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white">BANNI</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            {isSuperAdmin && usr.role === 'user' && (
                                                <PromoteAdminButton userId={usr.id} />
                                            )}
                                            {usr.role !== 'admin' && usr.role !== 'super_admin' && (
                                                <UserActions userId={usr.id} isBanned={usr.is_banned} />
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
