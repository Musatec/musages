const { Client } = require('pg');
require('dotenv').config();

async function test() {
    const url = process.env.DATABASE_URL;
    console.log("Connexion à:", url?.split('@')[1] || "INCONNUE");
    
    const client = new Client({
        connectionString: url,
        connectionTimeoutMillis: 5000,
    });

    try {
        console.log("Tentative de connexion TCP...");
        await client.connect();
        console.log("✅ Connexion réussie !");
        
        const res = await client.query('SELECT NOW()');
        console.log("Horloge DB:", res.rows[0].now);
        
        await client.end();
    } catch (err) {
        console.error("❌ Échec de la connexion:", err.message);
        if (err.stack) console.error(err.stack);
    }
}

test();
