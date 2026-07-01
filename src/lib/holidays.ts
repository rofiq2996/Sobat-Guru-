export const NATIONAL_HOLIDAYS_2026: Record<string, { title: string; type: string }> = {
  '2026-01-01': { title: 'Tahun Baru Masehi', type: 'libur' },
  '2026-02-17': { title: 'Isra Mikraj', type: 'libur' },
  '2026-02-20': { title: 'Tahun Baru Imlek', type: 'libur' },
  '2026-03-20': { title: 'Idul Fitri', type: 'libur' },
  '2026-03-21': { title: 'Idul Fitri', type: 'libur' },
  '2026-03-22': { title: 'Hari Raya Nyepi', type: 'libur' },
  '2026-04-03': { title: 'Wafat Isa Al Masih', type: 'libur' },
  '2026-05-01': { title: 'Hari Buruh Internasional', type: 'libur' },
  '2026-05-14': { title: 'Kenaikan Isa Al Masih', type: 'libur' },
  '2026-05-27': { title: 'Idul Adha', type: 'libur' },
  '2026-06-01': { title: 'Hari Lahir Pancasila', type: 'libur' },
  '2026-06-16': { title: 'Tahun Baru Islam 1448 H', type: 'libur' },
  '2026-08-17': { title: 'Hari Kemerdekaan RI', type: 'libur' },
  '2026-09-24': { title: 'Maulid Nabi Muhammad SAW', type: 'libur' },
  '2026-12-25': { title: 'Hari Raya Natal', type: 'libur' },
};

export function getNationalHolidays(year: number, month: number): Record<string, { title: string; time: string; type: string }[]> {
  const result: Record<string, { title: string; time: string; type: string }[]> = {};
  
  for (const [dateString, holiday] of Object.entries(NATIONAL_HOLIDAYS_2026)) {
    const d = new Date(dateString);
    if (d.getFullYear() === year && d.getMonth() === month) {
      result[dateString] = [{ ...holiday, time: 'Sepanjang hari' }];
    }
  }
  
  return result;
}

export function isHoliday(dateKey: string): boolean {
  // Return true if it's a Sunday or a national holiday
  const dateObj = new Date(dateKey);
  const isSunday = dateObj.getDay() === 0;
  
  if (isSunday) return true;
  return NATIONAL_HOLIDAYS_2026[dateKey] !== undefined;
}

export function getHolidayName(dateKey: string): string | null {
  const dateObj = new Date(dateKey);
  const isSunday = dateObj.getDay() === 0;
  if (NATIONAL_HOLIDAYS_2026[dateKey]) {
      return NATIONAL_HOLIDAYS_2026[dateKey].title;
  }
  if (isSunday) return 'Hari Minggu';
  return null;
}
