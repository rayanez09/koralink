import { NextResponse } from 'next/server'

// Mettre en cache la réponse pendant 1 heure (3600 secondes) pour éviter d'exploser les limites de l'API publique
export const revalidate = 3600

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const base = searchParams.get('base') || 'XOF'

    try {
        // Validation basique
        if (!['XOF', 'GHS'].includes(base)) {
            return NextResponse.json({ error: 'Base currency not supported' }, { status: 400 })
        }

        const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${base}`, {
            // Next.js fetch cache override to ensure it matches route segment config
            next: { revalidate: 3600 }
        })

        if (!response.ok) {
            throw new Error(`Exchangerate-API returned ${response.status}`)
        }

        const data = await response.json()
        return NextResponse.json(data)
    } catch (error: any) {
        console.error('Error fetching exchange rates:', error)
        return NextResponse.json({ error: 'Failed to fetch exchange rates' }, { status: 500 })
    }
}
