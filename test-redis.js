
require('dotenv').config();
const { Redis } = require("@upstash/redis");

async function testRedis() {
  console.log("🚀 Tentative de connexion à Upstash Redis...");
  
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  try {
    await redis.set("test_key", "MINDOS_OK_" + Date.now());
    const val = await redis.get("test_key");
    console.log("✅ Connexion réussie ! Valeur récupérée :", val);
  } catch (err) {
    console.error("❌ Erreur de connexion Redis :", err.message);
  }
}

testRedis();
