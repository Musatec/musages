const fs = require('fs');

const src = `C:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\a7617325-4504-4608-912e-d860715898d9\\taleem_app_logo_1785579219337.png`;
const dest = `c:\\Users\\HP\\Desktop\\musages\\public\\logo-taleem.png`;

try {
  fs.copyFileSync(src, dest);
  console.log("✅ Logo TaleemApp copié vers public/logo-taleem.png");
} catch (e) {
  console.error("Erreur copie logo:", e.message);
}
