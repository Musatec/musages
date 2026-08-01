const fs = require('fs');
const path = require('path');

const nextDir = path.join(__dirname, '..', '.next');

if (fs.existsSync(nextDir)) {
    try {
        fs.rmSync(nextDir, { recursive: true, force: true });
        console.log("✅ Dossier .next supprimé avec succès pour réinitialiser le cache Turbopack.");
    } catch (e) {
        console.error("Erreur nettoyage .next:", e.message);
    }
} else {
    console.log("ℹ️ Aucun dossier .next à supprimer.");
}
