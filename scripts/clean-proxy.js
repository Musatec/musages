const fs = require('fs');
const path = require('path');

const proxyFile = path.join(__dirname, '..', 'src', 'proxy.ts');

if (fs.existsSync(proxyFile)) {
    try {
        fs.unlinkSync(proxyFile);
        console.log("✅ src/proxy.ts a été supprimé avec succès.");
    } catch (e) {
        console.error("Erreur suppression:", e.message);
    }
} else {
    console.log("ℹ️ src/proxy.ts n'existe pas.");
}
