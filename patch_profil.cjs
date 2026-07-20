const fs = require('fs');
let code = fs.readFileSync('src/components/ProfilView.tsx', 'utf-8');

// Add import
code = code.replace(
  "import { useAppContext } from '../context/AppContext';",
  "import { useAppContext } from '../context/AppContext';\nimport { useToast } from '../context/ToastContext';"
);

// Add useToast hook inside component
code = code.replace(
  "const { teacher, setTeacher, classes,",
  "const { showToast } = useToast();\n  const { teacher, setTeacher, classes,"
);

// Replace alerts
code = code.replace(/alert\('Pengaturan berhasil disimpan!'\);/g, "showToast({ message: 'Pengaturan berhasil disimpan!' });");
code = code.replace(/setTimeout\(\(\) => alert\(`\$\{count\} agenda kalender baru berhasil diimpor!`\), 100\);/g, "showToast({ message: `${count} agenda kalender baru berhasil diimpor!` });");
code = code.replace(/alert\('Gagal mengimpor file excel kalender. Pastikan formatnya benar \(Kolom: Tanggal, Nama, Jenis\).'\);/g, "showToast({ message: 'Gagal mengimpor file excel kalender. Pastikan formatnya benar.', type: 'error' });");
code = code.replace(/alert\("Pilih minimal 1 kelas untuk mapel ini"\);/g, "showToast({ message: 'Pilih minimal 1 kelas untuk mapel ini', type: 'error' });");
code = code.replace(/alert\('Link dan data spreadsheet telah dihapus.'\);/g, "showToast({ message: 'Link dan data spreadsheet telah dihapus.' });");
code = code.replace(/alert\('Sukses! Seluruh data Anda telah dikosongkan dan direset.'\);/g, "showToast({ message: 'Sukses! Seluruh data Anda telah dikosongkan dan direset.' });");
code = code.replace(/alert\('Gagal melakukan reset data: ' \+ e\.message\);/g, "showToast({ message: 'Gagal melakukan reset data: ' + e.message, type: 'error' });");
code = code.replace(/alert\('Error: URL Apps Script tidak valid!\\nPastikan Anda menyalin URL Web App yang diakhiri dengan \/exec, BUKAN link editor.'\);/g, "showToast({ message: 'Error: URL Apps Script tidak valid!', type: 'error' });");
code = code.replace(/alert\(`Gagal mengakses Apps Script.\\nPastikan pengaturan deploy Web App adalah:\\n"Execute as: Me"\\n"Who has access: Anyone" \(Siapa saja\)`\);/g, "showToast({ message: 'Gagal mengakses Apps Script.', type: 'error' });");
code = code.replace(/alert\('Link Spreadsheet disinkronkan \/ disimpan!'\);/g, "showToast({ message: 'Link Spreadsheet disinkronkan / disimpan!' });");
code = code.replace(/alert\(`Error mengakses Apps Script \(Gagal tersambung\).\\n\\nKemungkinan penyebab:\\n1. Salah link \(Harus diakhiri \/exec\)\\n2. Deployment Apps Script belum di-set "Who has access: Anyone"\\n\\nDetail: \$\{e\.message\}`\);/g, "showToast({ message: `Error mengakses Apps Script.`, type: 'error' });");

fs.writeFileSync('src/components/ProfilView.tsx', code);
