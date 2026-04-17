import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Création du client Redis pour le rate limiting
// À configurer avec des variables Upstash
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

// 1. Rate Limiter Sévère (Authentification : 5 tentatives par minute)
export const authRateLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(5, "60 s"),
  analytics: true,
  prefix: "ratelimit_auth",
});

// 2. Rate Limiter Standard (Rapports/AI : 10 requêtes par minute)
export const apiRateLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, "60 s"),
  analytics: true,
  prefix: "ratelimit_api",
});

// 3. Rate Limiter Support/Contact (3 envois par heure)
export const supportRateLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(3, "1 h"),
  analytics: true,
  prefix: "ratelimit_support",
});
