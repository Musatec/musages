
const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://postgres:MusaProjet2026@ephsigjminwavcymicxa.supabase.co:5432/postgres"
});

async function run() {
  await client.connect();
  try {
    // 1. Mot de passe haché pour 'MusaProjet2026' via bcrypt
    const hashedPassword = "$2a$10$w.p.Lg.p9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9"; 
    // Correction: je vais en générer un vrai ci-dessous
    const bcrypt = require('bcryptjs');
    const realHash = await bcrypt.hash("MusaProjet2026", 10);

    // 2. Trouver ou créer un store par défaut (car requis par le schéma Prisma)
    const storeRes = await client.query('SELECT id FROM "Store" LIMIT 1');
    let storeId;
    if (storeRes.rows.length === 0) {
      const newStore = await client.query('INSERT INTO "Store" (id, name, "createdAt", "updatedAt", plan) VALUES ($1, $2, NOW(), NOW(), $3) RETURNING id', ['default-store', 'Ma Boutique Elite', 'STARTER']);
      storeId = newStore.rows[0].id;
    } else {
      storeId = storeRes.rows[0].id;
    }

    // 3. Upsert de l'utilisateur
    const email = "musatech0000@gmail.com";
    await client.query(`
      INSERT INTO "User" (id, email, password, role, "storeId", "createdAt", "updatedAt") 
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      ON CONFLICT (email) DO UPDATE SET password = $3, role = $4, "storeId" = $5
    `, ['cl_admin_01', email, realHash, 'ADMIN', storeId]);

    console.log("✅ UTILISATEUR DÉBLOQUÉ avec succès !");
    console.log("Email : " + email);
    console.log("Password : MusaProjet2026");

  } catch (err) {
    console.error("Erreur fatale:", err.message);
  } finally {
    await client.end();
  }
}

run();
