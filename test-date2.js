const d = "Sun Jul 19 2026 00:00:00 GMT+0700 (Western Indonesia Time)";
const sanitizeDate = (dateStr) => {
  if (!dateStr) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    // If the string contains a time zone but we want the raw date part, we can parse it from string
    // "Sun Jul 19 2026..."
    const parts = dateStr.split(' ');
    if (parts.length >= 4) {
      const months = { Jan:'01', Feb:'02', Mar:'03', Apr:'04', May:'05', Jun:'06', Jul:'07', Aug:'08', Sep:'09', Oct:'10', Nov:'11', Dec:'12' };
      const month = months[parts[1]];
      const day = parts[2].padStart(2, '0');
      const year = parts[3];
      if (month && day && year && year.length === 4) {
         return `${year}-${month}-${day}`;
      }
    }
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  return dateStr;
};
console.log(sanitizeDate(d));
