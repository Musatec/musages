const fs = require('fs');
const path = require('path');

const src = 'C:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\a7617325-4504-4608-912e-d860715898d9\\taleem_app_logo_1785579219337.png';
const dest1 = path.join(__dirname, '..', 'public', 'logo-taleem.png');
const dest2 = path.join(__dirname, '..', 'public', 'logo.png');

if (fs.existsSync(src)) {
  try {
    fs.copyFileSync(src, dest1);
    fs.copyFileSync(src, dest2);
    console.log("✅ Logo TaleemApp copié avec succès dans public/logo-taleem.png !");
  } catch (e) {
    console.error("Erreur de copie logo:", e.message);
  }
} else {
  console.log("⚠️ Fichier source introuvable à l'emplacement indiqué.");
}
