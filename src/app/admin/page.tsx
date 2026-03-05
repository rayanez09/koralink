import { createAdminClient } from '@/lib/supabase/admin'

export default async function AdminDashboardPage() {
    // Use supabaseAdmin to fetch ALL transactions, bypassing RLS
    const supabaseAdmin = createAdminClient()
    const { data: transactions, error } = await supabaseAdmin
        .from('transactions')
        .select('*, users(full_name, email)')
        .order('created_at', { ascending: false })

    if (error) {
        return <div className="p-4 text-red-500">Failed to load admin data: {error.message}</div>
    }

    // KPIs
    const totalVolume = transactions?.filter(t => t.status === 'success').reduce((sum, t) => sum + t.amount_sent, 0) || 0
    const appRevenue = transactions?.filter(t => t.status === 'success').reduce((sum, t) => sum + t.app_fee, 0) || 0
    const successCount = transactions?.filter(t => t.status === 'success').length || 0
    const totalCount = transactions?.filter(t => t.status !== 'pending').length || 1 // Avoid div / 0
    const successRate = ((successCount / totalCount) * 100).toFixed(1)

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Aperçu Administrateur</h1>
                <p className="text-slate-500">Supervisez les transactions et les revenus de la plateforme.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <p className="text-sm font-medium text-slate-500 mb-1">Volume Total</p>
                    <p className="text-2xl font-bold text-slate-900">{totalVolume.toFixed(2)} XOF</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <p className="text-sm font-medium text-slate-500 mb-1">Revenus Plateforme</p>
                    <p className="text-2xl font-bold text-emerald-600">{appRevenue.toFixed(2)} XOF</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <p className="text-sm font-medium text-slate-500 mb-1">Total Transactions</p>
                    <p className="text-2xl font-bold text-slate-900">{transactions?.length || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <p className="text-sm font-medium text-slate-500 mb-1">Taux de Succès</p>
                    <p className="text-2xl font-bold text-slate-900">{successRate}%</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                    <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Toutes les Transactions</h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-slate-500 font-medium">
                            <tr>
                                <th className="px-6 py-3">Réf / Date</th>
                                <th className="px-6 py-3">Utilisateur</th>
                                <th className="px-6 py-3">Couloir</th>
                                <th className="px-6 py-3 text-right">Montant</th>
                                <th className="px-6 py-3 text-right">Revenus</th>
                                <th className="px-6 py-3">Statut</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {transactions?.map((tx) => (
                                <tr key={tx.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4">
                                        <div className="font-mono text-xs text-slate-500" title={tx.id}>{tx.id.substring(0, 8)}...</div>
                                        <div className="text-slate-400 text-xs">{new Date(tx.created_at).toLocaleString()}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-900">{tx.users?.full_name || 'Inconnu'}</div>
                                        <div className="text-slate-500 text-xs">{tx.users?.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-slate-900">{tx.sender_country} &rarr; {tx.receiver_country}</div>
                                        <div className="text-xs text-slate-500">{tx.recipient_number} ({tx.recipient_name})</div>
                                    </td>
                                    <td className="px-6 py-4 text-right font-medium text-slate-900">
                                        {Number(tx.amount_sent).toFixed(2)} {tx.currency_sent || 'XOF'}
                                    </td>
                                    <td className="px-6 py-4 text-right font-medium text-emerald-600">
                                        {Number(tx.app_fee).toFixed(2)} {tx.currency_sent || 'XOF'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${tx.status === 'success' ? 'bg-emerald-100 text-emerald-800' :
                                            tx.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                            {tx.status.toUpperCase()}
                                        </span>
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
