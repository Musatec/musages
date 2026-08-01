const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, '..', 'src', 'middleware.ts');

if (fs.existsSync(target)) {
  try {
    fs.unlinkSync(target);
    console.log('✅ File src/middleware.ts deleted.');
  } catch (e) {
    console.error('Error deleting src/middleware.ts:', e);
  }
} else {
  console.log('File src/middleware.ts does not exist.');
}
