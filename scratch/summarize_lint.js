const fs = require('fs');
let content = fs.readFileSync('lint_results_utf8.json', 'utf8');
if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
}
const data = JSON.parse(content);
const errors = data.filter(f => f.errorCount > 0);
console.log(`Total files with errors: ${errors.length}`);
errors.forEach(f => {
    console.log(`File: ${f.filePath}`);
    f.messages.filter(m => m.severity === 2).forEach(m => {
        console.log(`  Line ${m.line}:${m.column} - ${m.message} (${m.ruleId})`);
    });
});
