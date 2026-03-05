import Link from 'next/link'

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-zinc-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-zinc-100 p-8 sm:p-12">
                <div className="mb-8 border-b border-zinc-100 pb-8">
                    <Link href="/" className="inline-block mb-6">
                        <span className="text-xl font-bold tracking-tight text-blue-900">
                            Kora<span className="text-blue-600">Link</span>
                        </span>
                    </Link>
                    <h1 className="text-3xl font-bold text-zinc-900">Conditions Générales d'Utilisation et de Confidentialité</h1>
                    <p className="text-zinc-500 mt-2">Dernière mise à jour : 5 Mars 2026</p>
                </div>

                <div className="prose prose-zinc max-w-none text-zinc-700 space-y-6">
                    <section>
                        <h2 className="text-xl font-bold text-zinc-900 mt-8 mb-4">1. Acceptation des conditions</h2>
                        <p>
                            En créant un compte sur KoraLink, vous acceptez sans réserve les présentes Conditions Générales d'Utilisation.
                            Ces conditions régissent votre utilisation de notre plateforme de transfert d'argent.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-zinc-900 mt-8 mb-4">2. Vérification d'identité</h2>
                        <p>
                            Pour garantir la sécurité de notre plateforme et respecter les régulations financières internationales (KYC/AML),
                            vous acceptez de fournir des informations exactes, y compris une adresse e-mail valide et un numéro de téléphone
                            qui devront être vérifiés obligatoirement avant tout transfert de fonds.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-zinc-900 mt-8 mb-4">3. Sécurité des opérations</h2>
                        <p>
                            Chaque transfert d'argent est sécurisé par un code PIN personnel à 4 chiffres. Ce code est strictement confidentiel.
                            KoraLink ne pourra pas être tenu responsable des pertes financières résultant de la divulgation de votre code PIN
                            ou de vos identifiants à des tiers.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-zinc-900 mt-8 mb-4">4. Limites et Frais</h2>
                        <p>
                            L'utilisation de KoraLink est soumise à des frais de plateforme de 0.6% par transaction, appliqués de
                            manière transparente lors de la simulation. Des limites d'envoi journalières et mensuelles sont appliquées
                            à votre profil en fonction de votre historique et de votre statut de vérification.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-zinc-900 mt-8 mb-4">5. Confidentialité des données</h2>
                        <p>
                            Nous collectons et traitons vos données personnelles (identifiant, coordonnées) uniquement dans le but
                            d'assurer le service de transfert et répondre à nos obligations légales. KoraLink ne revend aucune
                            donnée personnelle à des tiers à des fins publicitaires.
                        </p>
                    </section>
                </div>

                <div className="mt-12 pt-8 border-t border-zinc-100">
                    <Link href="/register">
                        <span className="text-blue-600 hover:text-blue-700 font-medium">← Retour à l'inscription</span>
                    </Link>
                </div>
            </div>
        </div>
    )
}
