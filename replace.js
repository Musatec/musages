const fs = require('fs');
const path = 'src/app/[locale]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Global landing wrapper
content = content.replace('bg-black text-white', 'bg-background text-foreground');

// Navbar
content = content.replace('bg-black/80 backdrop-blur-xl border-white/10', 'bg-background/80 backdrop-blur-xl border-border');

// Bento Grid Backgrounds
content = content.replace(/bg-zinc-900 border border-white\/5/g, 'bg-card border border-border shadow-md');

// Text Colors in Bento
content = content.replace(/text-white group-hover:/g, 'text-foreground group-hover:');

// CTA
content = content.replace('bg-gradient-to-br from-zinc-900 to-black border border-white/5', 'bg-gradient-to-br from-card to-background border border-border shadow-2xl');

// Footer
content = content.replace('border-t border-white/5 bg-black', 'border-t border-border bg-background');

// Pricing Card
content = content.replace('"bg-zinc-900/50 border-white/10 hover:border-white/20"', '"bg-card border-border shadow-lg hover:border-primary/30"');
content = content.replace('text-white', 'text-foreground');
content = content.replace('text-white', 'text-foreground');
content = content.replace('bg-white/10', 'bg-foreground/10');
content = content.replace('text-white/40', 'text-foreground/40');
content = content.replace('"bg-white/5 text-white hover:bg-white/10 border border-white/10 shadow-xl"', '"bg-foreground/5 text-foreground hover:bg-foreground/10 border border-border shadow-xl"');

fs.writeFileSync(path, content, 'utf8');
console.log('Replacements complete');
