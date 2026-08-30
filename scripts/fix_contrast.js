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

            // Replace hardcoded grays with semantic muted-foreground or foreground alphas
            // Most "500" grays on white backgrounds are too light.
            content = content.replace(/\btext-zinc-500\b/g, 'text-muted-foreground');
            content = content.replace(/\btext-gray-500\b/g, 'text-muted-foreground');
            content = content.replace(/\btext-slate-500\b/g, 'text-muted-foreground');
            
            // "400" grays are definitely too light on white
            content = content.replace(/\btext-zinc-400\b/g, 'text-muted-foreground');
            content = content.replace(/\btext-gray-400\b/g, 'text-muted-foreground');
            
            // "600" grays can be muted-foreground too
            content = content.replace(/\btext-zinc-600\b/g, 'text-muted-foreground');

            // Handle some remaining text-white/XX since I might have missed them
            content = content.replace(/text-white\/30/g, 'text-foreground/30');
            content = content.replace(/text-white\/70/g, 'text-foreground/70');
            content = content.replace(/text-white\/80/g, 'text-foreground/80');
            content = content.replace(/text-white\/90/g, 'text-foreground/90');
            
            if (content !== originalContent) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('Updated Contrast:', fullPath);
            }
        }
    }
}

processDir(path.join(__dirname, 'src/app'));
console.log('Done upgrading contrast across src/app');
