import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Création du client Redis pour le rate limiting
// À configurer avec des variables Upstash
const isConfigured = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

const redis = isConfigured 
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

// Helper to bypass if not configured
const bypassLimit = () => Promise.resolve({ success: true, limit: 0, remaining: 0, reset: 0 });

// 1. Rate Limiter Sévère (Authentification : 5 tentatives par minute)
const realAuthRateLimit = redis ? new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(5, "60 s"),
  analytics: true,
  prefix: "ratelimit_auth",
}) : null;

export const authRateLimit = {
    limit: (key: string) => realAuthRateLimit ? realAuthRateLimit.limit(key) : bypassLimit()
};

// 2. Rate Limiter Standard (Rapports/AI : 10 requêtes par minute)
const realApiRateLimit = redis ? new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, "60 s"),
  analytics: true,
  prefix: "ratelimit_api",
}) : null;

export const apiRateLimit = {
    limit: (key: string) => realApiRateLimit ? realApiRateLimit.limit(key) : bypassLimit()
};

// 3. Rate Limiter Support/Contact (3 envois par heure)
const realSupportRateLimit = redis ? new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(3, "1 h"),
  analytics: true,
  prefix: "ratelimit_support",
}) : null;

export const supportRateLimit = {
    limit: (key: string) => realSupportRateLimit ? realSupportRateLimit.limit(key) : bypassLimit()
};

