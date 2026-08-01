const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSchema() {
  try {
    const products = await prisma.product.findMany({ take: 1 });
    console.log("✅ Connexion réussie !");
    console.log("Champs disponibles sur Product:", Object.keys(products[0] || {}));
    if (products.length === 0) {
        console.log("Aucun produit pour tester, mais la requête est passée.");
    }
  } catch (err) {
    console.error("❌ Erreur:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkSchema();
