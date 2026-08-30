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

            // Common global background
            content = content.replace(/bg-\[\#09090b\]/g, 'bg-background');
            content = content.replace(/bg-zinc-950/g, 'bg-card');
            content = content.replace(/bg-zinc-900/g, 'bg-card');
            
            // Text colors
            // Do NOT replace text-white if it's inside a button that clearly needs to be white, but tailwind text-foreground adapts.
            // Actually `text-foreground` becomes white in dark mode.
            // Only replace explicit `text-white` that isn't `text-white/XX`.
            content = content.replace(/\btext-white\b(?![\/\-])/g, 'text-foreground');
            
            // Borders with explicit generic white variations
            content = content.replace(/border-white\/5/g, 'border-border/50');
            content = content.replace(/border-white\/10/g, 'border-border/50');
            content = content.replace(/border-white\/20/g, 'border-border');
            
            // White background alphas (used for glassmorphism often)
            // They need to be foreground alphas so they work in light mode (where foreground is black)
            content = content.replace(/bg-white\/5/g, 'bg-foreground/5');
            content = content.replace(/bg-white\/10/g, 'bg-foreground/10');
            content = content.replace(/bg-white\/20/g, 'bg-foreground/20');
            content = content.replace(/bg-white\/\[0\.02\]/g, 'bg-foreground/[0.02]');
            content = content.replace(/bg-white\/\[0\.03\]/g, 'bg-foreground/[0.03]');
            content = content.replace(/bg-white\/\[0\.05\]/g, 'bg-foreground/[0.05]');

            // Text alphas
            content = content.replace(/text-white\/40/g, 'text-foreground/40');
            content = content.replace(/text-white\/50/g, 'text-foreground/50');
            content = content.replace(/text-white\/60/g, 'text-foreground/60');
            
            if (content !== originalContent) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('Updated:', fullPath);
            }
        }
    }
}

processDir(path.join(__dirname, 'src/app'));
console.log('Done cleaning colors in src/app');
