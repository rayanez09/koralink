import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Navigation Layer */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">Kora<span className="text-blue-600">Link</span></span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden sm:block text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Connexion
            </Link>
            <Link href="/register" className="text-sm font-medium bg-slate-900 text-white px-5 py-2.5 rounded-full hover:bg-slate-800 transition-all shadow-sm">
              Créer un compte
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-slate-50 pt-16 sm:pt-24 lg:pt-32 pb-16">
          <div className="absolute inset-0 bg-[url('https://grid.dianawm.com/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-medium mb-8">
              <span className="flex h-2 w-2 rounded-full bg-blue-600"></span>
              L'infrastructure nouvelle génération
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 max-w-4xl mx-auto leading-tight">
              Les transferts intra-africains, <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">réinventés.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              KoraLink optimise l'accès aux rails financiers africains. Transférez de l'argent instantanément avec une transparence totale et seulement <strong className="text-slate-900">0.6% de frais</strong> par transaction.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register" className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-blue-600/25 flex items-center justify-center gap-2">
                Démarrer maintenant
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </Link>
              <Link href="#features" className="w-full sm:w-auto px-8 py-4 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl font-semibold transition-all shadow-sm flex items-center justify-center">
                Découvrir la solution
              </Link>
            </div>
          </div>
        </section>

        {/* The Problem / Solution Pattern */}
        <section id="features" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Pourquoi KoraLink ?</h2>
              <p className="text-slate-600 text-lg">Nous remplaçons les pourcentages abusifs et la lenteur par une technologie propre, rapide et transparente.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 hover:border-blue-100 transition-colors">
                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-6">
                  <svg className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Frais de seulement 0.6%</h3>
                <p className="text-slate-600 leading-relaxed">
                  Fini les 2% à 10% de frais des méthodes traditionnelles. KoraLink applique un coût transparent de <strong className="text-slate-900">0.6%</strong>, peu importe le montant.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 hover:border-emerald-100 transition-colors">
                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-6">
                  <svg className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Vitesse API Moneroo</h3>
                <p className="text-slate-600 leading-relaxed">
                  Grâce à notre infrastructure montée sur Moneroo, vos transferts sont exécutés et livrés sur mobile money de manière quasi instantanée.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 hover:border-purple-100 transition-colors">
                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-6">
                  <svg className="w-7 h-7 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Sécurité & Centralisation</h3>
                <p className="text-slate-600 leading-relaxed">
                  Une seule interface pour l'Afrique entière. Protégée par authentification avancée, Row Level Security et code PIN par transfert.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats CTA */}
        <section className="bg-slate-900 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">Prêt à moderniser vos transferts ?</h2>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/register" className="px-8 py-4 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-100 transition-colors">
                Créer un compte gratuit
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-sm">
          <div className="flex flex-col md:flex-row items-center gap-2">
            <span className="font-bold text-slate-900 text-base">Kora<span className="text-blue-600">Link</span></span>
            <span className="hidden md:inline">&middot;</span>
            <span>Système propulsé par l'infrastructure Moneroo.</span>
          </div>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-slate-900 transition-colors">Conditions d'utilisation</Link>
            <span>&copy; {new Date().getFullYear()} KoraLink MVP</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
