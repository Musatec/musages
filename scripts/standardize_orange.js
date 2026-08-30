const fs = require('fs');
const path = require('path');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            const originalContent = content;

            // Replace orange-500 with primary to use the new lava orange
            content = content.replace(/\borange-500\b/g, 'primary');
            content = content.replace(/\borange-400\b/g, 'primary/80');
            content = content.replace(/\borange-600\b/g, 'primary');
            
            // For hex codes if any
            content = content.replace(/#F97316/gi, 'hsl(var(--primary))');
            content = content.replace(/#ea580c/gi, 'hsl(var(--primary))');

            if (content !== originalContent) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('Updated:', fullPath);
            }
        }
    }
}

processDir(path.join(__dirname, 'src/app'));
console.log('Done standardizing orange to Lava Primary');
