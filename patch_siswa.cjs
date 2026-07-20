const fs = require('fs');
let code = fs.readFileSync('src/components/SiswaView.tsx', 'utf-8');

code = code.replace(/alert\('Gagal mengimpor file excel. Pastikan formatnya benar.*?'\);/g, "showToast({ message: 'Gagal mengimpor file excel. Pastikan formatnya benar.', type: 'error' });");
fs.writeFileSync('src/components/SiswaView.tsx', code);
