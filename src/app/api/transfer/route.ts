import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { TransferController } from '@/controllers/transfer.controller'
import { checkRateLimit } from '@/utils/rate-limit'
import { z } from 'zod'

const transferSchema = z.object({
    senderCountry: z.string().min(2),
    receiverCountry: z.string().min(2),
    amount: z.number().positive(),
    currency: z.string().length(3),
    recipientNumber: z.string().min(8),
})

export async function POST(req: NextRequest) {
    // 1. Rate Limiting Check
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1'
    if (!checkRateLimit(ip)) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    // 2. Authentication Check
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        // 3. Input validation
        const body = await req.json()
        const parsedData = transferSchema.parse(body)

        // 4. Controller Delegation
        const result = await TransferController.handleTransfer(user.id, parsedData, ip)

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 400 })
        }

        return NextResponse.json({ success: true, transactionId: result.transactionId })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid payload', details: (error as z.ZodError<any>).issues }, { status: 400 })
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
