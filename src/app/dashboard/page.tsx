import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default async function DashboardPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    // Fetch transactions using RLS
    const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

    // Calculate stats
    const totalSent = transactions?.filter(t => t.status === 'success').reduce((sum, t) => sum + t.amount_sent, 0) || 0
    const totalFeesPaid = transactions?.filter(t => t.status === 'success').reduce((sum, t) => sum + t.app_fee, 0) || 0

    return (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900">Bienvenue</h1>
                    <p className="text-zinc-500">Voici vos activités récentes et statistiques.</p>
                </div>
                <Link href="/dashboard/transfer">
                    <Button variant="primary" className="shadow-md shadow-blue-600/20 px-6">
                        + Nouveau Transfert
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 flex flex-col justify-center">
                    <p className="text-sm font-medium text-zinc-500 mb-1">Total Envoyé</p>
                    <p className="text-3xl font-bold text-zinc-900">{totalSent.toFixed(2)} XOF</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 flex flex-col justify-center">
                    <p className="text-sm font-medium text-zinc-500 mb-1">Total des Frais Payés</p>
                    <p className="text-3xl font-bold text-zinc-900">{totalFeesPaid.toFixed(2)} XOF</p>
                </div>
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl shadow-md text-white flex flex-col justify-center">
                    <p className="text-sm font-medium text-blue-100 mb-1">Transferts Actifs</p>
                    <p className="text-3xl font-bold">
                        {transactions?.filter(t => ['pending', 'awaiting_payment', 'payout_pending'].includes(t.status)).length || 0}
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden">
                <div className="p-6 border-b border-zinc-100">
                    <h2 className="text-lg font-semibold text-zinc-900">Transactions Récentes</h2>
                </div>

                {(!transactions || transactions.length === 0) ? (
                    <div className="p-12 text-center text-zinc-500">
                        Aucun transfert trouvé. <Link href="/dashboard/transfer" className="text-blue-600 hover:underline">Initiez votre premier transfert</Link>.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-zinc-50 text-zinc-600 font-medium">
                                <tr>
                                    <th className="px-6 py-4">Statut</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Bénéficiaire</th>
                                    <th className="px-6 py-4">Destination</th>
                                    <th className="px-6 py-4 text-right">Montant Envoyé</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {transactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-zinc-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            {(() => {
                                                const statusMap: Record<string, { label: string, classes: string }> = {
                                                    success: { label: 'SUCCÈS', classes: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
                                                    failed: { label: 'ÉCHEC', classes: 'bg-red-100 text-red-800 border-red-200' },
                                                    pending: { label: 'EN COURS', classes: 'bg-amber-100 text-amber-800 border-amber-200' },
                                                    awaiting_payment: { label: 'À PAYER', classes: 'bg-blue-100 text-blue-800 border-blue-200' },
                                                    payout_pending: { label: 'ENVOI...', classes: 'bg-indigo-100 text-indigo-800 border-indigo-200' }
                                                }
                                                const s = statusMap[tx.status] || { label: tx.status.toUpperCase(), classes: 'bg-zinc-100 text-zinc-800' }
                                                return (
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${s.classes}`}>
                                                        {s.label}
                                                    </span>
                                                )
                                            })()}
                                        </td>
                                        <td className="px-6 py-4 text-zinc-600">{new Date(tx.created_at).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 font-medium text-zinc-900">
                                            {tx.recipient_name || 'Inconnu'}<br />
                                            <span className="text-xs text-zinc-500 font-normal">{tx.recipient_number}</span>
                                        </td>
                                        <td className="px-6 py-4 text-zinc-600">{tx.receiver_country}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="font-medium text-zinc-900">{Number(tx.amount_sent).toFixed(2)} {tx.currency_sent || 'XOF'}</div>
                                            <div className="text-xs text-zinc-500">Frais: {Number(tx.app_fee).toFixed(2)} {tx.currency_sent || 'XOF'}</div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
