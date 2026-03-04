/**
 * Basic In-Memory Rate Limiting Utility
 * In a real production environment, use Upstash Redis `@upstash/ratelimit` or similar.
 */

interface RateLimitTracker {
    count: number;
    resetTime: number;
}

const rateLimits = new Map<string, RateLimitTracker>();

export function checkRateLimit(ip: string): boolean {
    const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '10', 10);
    const windowMs = 60 * 1000; // 1 minute window

    const now = Date.now();
    const userRecord = rateLimits.get(ip);

    if (!userRecord) {
        rateLimits.set(ip, {
            count: 1,
            resetTime: now + windowMs,
        });
        return true; // Allowed
    }

    // If the window has expired, reset the count
    if (now > userRecord.resetTime) {
        userRecord.count = 1;
        userRecord.resetTime = now + windowMs;
        return true; // Allowed
    }

    // Window is still active, increment count
    userRecord.count += 1;

    if (userRecord.count > maxRequests) {
        return false; // Denied
    }

    return true; // Allowed
}
