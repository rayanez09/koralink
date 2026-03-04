import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 text-zinc-900">
      <main className="flex-1 flex flex-col items-center justify-center w-full px-5 text-center">
        <div className="max-w-3xl space-y-8">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-blue-900">
            Kora<span className="text-blue-600">Link</span>
          </h1>
          <p className="text-xl md:text-2xl text-zinc-600 font-light">
            Seamless and secure international money transfers across Africa.
            Experience the future of cross-border payments.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link
              href="/register"
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-blue-600/20 w-full sm:w-auto"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 bg-white border border-zinc-200 hover:border-blue-600 hover:text-blue-600 text-zinc-800 rounded-lg font-medium transition-colors shadow-sm w-full sm:w-auto"
            >
              Sign In
            </Link>
          </div>
        </div>

        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full text-left">
          <div className="p-6 bg-white rounded-2xl shadow-sm border border-zinc-100">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 text-blue-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Instant Transfers</h3>
            <p className="text-zinc-600">Send money in seconds with our optimized routing network using Moneroo.</p>
          </div>
          <div className="p-6 bg-white rounded-2xl shadow-sm border border-zinc-100">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4 text-emerald-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Bank-Grade Security</h3>
            <p className="text-zinc-600">Your funds are never held by us. We use advanced encryption and strict RLS policies.</p>
          </div>
          <div className="p-6 bg-white rounded-2xl shadow-sm border border-zinc-100">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4 text-amber-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Transparent Fees</h3>
            <p className="text-zinc-600">Only 0.5% + $0.01 per transaction. You always see exactly what the recipient gets.</p>
          </div>
        </div>
      </main>

      <footer className="w-full py-6 text-center text-sm text-zinc-500">
        &copy; {new Date().getFullYear()} KoraLink. All rights reserved. MVP Version.
      </footer>
    </div>
  )
}
