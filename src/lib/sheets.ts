import { getAccessToken } from './auth';

const FILE_NAME = 'Database Sobat Guru';

const REQUIRED_SHEETS = [
  'Pengaturan', 'Kelas', 'Mapel', 'Agenda', 'Siswa', 'Jadwal', 'Jurnal', 'Kehadiran', 'Nilai', 'Catatan'
];

export const getDatabaseFileId = async (accessToken: string): Promise<string | null> => {
  const query = encodeURIComponent(`name='${FILE_NAME}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`);
  const response = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&spaces=drive`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store'
  });
  
  if (response.status === 401) {
    throw new Error('Not authenticated');
  }
  if (!response.ok) throw new Error('Failed to query drive');
  
  const data = await response.json();
  if (data.files && data.files.length > 0) {
    return data.files[0].id;
  }
  return null;
};

const createSpreadsheet = async (accessToken: string): Promise<string> => {
  const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      properties: { title: FILE_NAME },
      sheets: REQUIRED_SHEETS.map(title => ({ properties: { title } }))
    })
  });
  if (!res.ok) throw new Error('Failed to create spreadsheet');
  const data = await res.json();
  return data.spreadsheetId;
};

const ensureSheetsExist = async (fileId: string, accessToken: string) => {
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${fileId}?fields=sheets.properties(title,sheetId)`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store'
  });
  if (!res.ok) throw new Error('Failed to fetch spreadsheet details');
  const data = await res.json();
  const existingTitles = data.sheets.map((s: any) => s.properties.title);
  
  const missingSheets = REQUIRED_SHEETS.filter(s => !existingTitles.includes(s));
  
  if (missingSheets.length > 0) {
    const requests = missingSheets.map(title => ({
      addSheet: { properties: { title } }
    }));
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${fileId}:batchUpdate`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ requests })
    });
  }
};

export const readDatabase = async (spreadsheetUrl?: string | null): Promise<any | null> => {
  if (spreadsheetUrl) {
    try {
      const res = await fetch(spreadsheetUrl, { 
        method: 'POST',
        body: JSON.stringify({ action: 'read' }),
        redirect: 'follow'
      });
      if (!res.ok) throw new Error('Apps Script fetch failed');
      const result = await res.json();
      if (result && result.status === 'success') {
         return result.data;
      }
    } catch (err) {
      console.warn("Error reading from custom Apps Script URL", err);
    }
  }

  try {
    const accessToken = await getAccessToken();
    if (!accessToken) return null;

    const fileId = await getDatabaseFileId(accessToken);
    if (!fileId) return null;

    await ensureSheetsExist(fileId, accessToken);

    const ranges = REQUIRED_SHEETS.map(s => `'${s}'!A:Z`);
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${fileId}/values:batchGet?` + ranges.map(r => `ranges=${encodeURIComponent(r)}`).join('&');
    const response = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` }, cache: 'no-store' });

    if (response.status === 401) return null;
    if (!response.ok) throw new Error('Failed to read spreadsheet data');
    const batchData = await response.json();
    
    if (!batchData.valueRanges) return null;

    const getSheetData = (sheetName: string): any[][] => {
      const rangeParams = batchData.valueRanges.find((r: any) => {
        const cleanRange = r.range.replace(/'/g, '');
        return cleanRange.startsWith(`${sheetName}!`);
      });
      return rangeParams?.values || [];
    };

    const pengRows = getSheetData('Pengaturan');
    const kelasRows = getSheetData('Kelas');
    const mapelRows = getSheetData('Mapel');
    const agendaRows = getSheetData('Agenda');
    const siswaRows = getSheetData('Siswa');
    const jadwalRows = getSheetData('Jadwal');
    const jurnalRows = getSheetData('Jurnal');
    const hadirRows = getSheetData('Kehadiran');
    const nilaiRows = getSheetData('Nilai');
    const catatanRows = getSheetData('Catatan');

    const result: any = {
      teacher: { name: '', role: '', school: '' },
      semester: 'Ganjil',
      schoolType: '5 Hari (Senin - Jumat)',
      classes: [], subjects: [], agendas: {}, students: [], jadwals: [], jurnals: [], attendances: {}, grades: {}, catatan: []
    };

    // Parse Pengaturan
    for(let i = 1; i < pengRows.length; i++){
      const [k, v] = pengRows[i];
      if (!k) continue;
      if (k === 'teacher_name') result.teacher.name = v;
      else if (k === 'teacher_role') result.teacher.role = v;
      else if (k === 'teacher_school') result.teacher.school = v;
      else if (k === 'semester') result.semester = v;
      else if (k === 'schoolType') result.schoolType = v;
    }

    // Parse array data
    if (kelasRows.length > 1) {
      result.classes = kelasRows.slice(1).map((r: any) => r[0]).filter(Boolean);
    }
    if (mapelRows.length > 1) {
      result.subjects = mapelRows.slice(1).map((r: any) => ({
        id: r[0] != null ? String(r[0]) : '', name: r[1] != null ? String(r[1]) : '', kkm: Number(r[2] || 0), classes: (r[3] || '').split(', ').filter(Boolean)
      })).filter((s: any) => s.id && s.name);
    }
    if (agendaRows.length > 1) {
      agendaRows.slice(1).forEach((r: any) => {
        const [date, title, time, type] = r;
        if (!date || !title) return;
        if (!result.agendas[date]) result.agendas[date] = [];
        result.agendas[date].push({ title, time: time || '', type: type || '' });
      });
    }
    if (siswaRows.length > 1) {
      result.students = siswaRows.slice(1).map((r: any) => ({
        id: r[0] != null ? String(r[0]).replace(/^'/, '') : '', name: r[1] != null ? String(r[1]) : '', class: r[2] != null ? String(r[2]) : '', gender: r[3] != null ? String(r[3]) : ''
      })).filter((s: any) => s.id && s.name);
    }
    if (jadwalRows.length > 1) {
      result.jadwals = jadwalRows.slice(1).map((r: any) => ({
        id: Number(r[0] || 0), hari: r[1] != null ? String(r[1]) : '', waktu: r[2] != null ? String(r[2]) : '', kelas: r[3] != null ? String(r[3]) : '', mapel: r[4] != null ? String(r[4]) : ''
      })).filter((s: any) => s.id && s.hari);
    }
    if (jurnalRows.length > 1) {
      result.jurnals = jurnalRows.slice(1).map((r: any) => ({
        id: Number(r[0] || 0), date: String(r[1] || ''), class: String(r[2] || ''), mapel: String(r[3] || ''), topic: String(r[4] || ''), notes: String(r[5] || '')
      })).filter((s: any) => s.id && s.date);
    }
    if (hadirRows.length > 1) {
      hadirRows.slice(1).forEach((r: any) => {
        const [key, id, name, status, note, isLocked] = r;
        if (!key || !id) return;
        if (!result.attendances[key]) result.attendances[key] = [];
        result.attendances[key].push({
          id: Number(id || 0), name: String(name || ''), status: String(status || ''), note: String(note || ''), isLocked: String(isLocked).toUpperCase() === 'TRUE'
        });
      });
    }
    if (nilaiRows.length > 1) {
      nilaiRows.slice(1).forEach((r: any) => {
        const [key, id, name, nilai, isLocked, sikap, karakter] = r;
        if (!key || !id) return;
        if (!result.grades[key]) result.grades[key] = [];
        result.grades[key].push({
          id: Number(id || 0), name: String(name || ''), nilai: String(nilai || ''), isLocked: String(isLocked).toUpperCase() === 'TRUE', sikap: String(sikap || ''), karakter: String(karakter || '')
        });
      });
    }
    if (catatanRows.length > 1) {
      result.catatan = catatanRows.slice(1).map((r: any) => ({
        id: Number(r[0] || 0), date: String(r[1] || ''), name: String(r[2] || ''), issue: String(r[3] || ''), action: String(r[4] || ''), status: String(r[5] || '')
      })).filter((s: any) => s.id && s.date);
    }

    return result;
  } catch (error) {
    console.error("Error reading database:", error);
    throw error;
  }
};

export const saveDatabase = async (data: any, spreadsheetUrl?: string | null): Promise<void> => {
  if (spreadsheetUrl) {
    try {
      const res = await fetch(spreadsheetUrl, { 
        method: 'POST', 
        body: JSON.stringify({ action: 'save', data }),
        redirect: 'follow'
      });
      if (!res.ok) throw new Error('Apps Script fetch failed');
      return; // Successfully saved
    } catch (err) {
      console.warn("Error saving to custom Apps Script URL", err);
    }
  }

  try {
    const accessToken = await getAccessToken();
    if (!accessToken) return;

    let fileId = await getDatabaseFileId(accessToken);
    if (!fileId) {
      fileId = await createSpreadsheet(accessToken);
    }

    await ensureSheetsExist(fileId, accessToken);

    try {
      const clearRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${fileId}/values:batchClear`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ranges: REQUIRED_SHEETS.map(s => `'${s}'!A:Z`) })
      });
      if (!clearRes.ok) {
        console.warn("Failed to batchClear, status:", clearRes.status, await clearRes.text());
      }
    } catch (e) {
      console.warn("Exception during batchClear, proceeding with update anyway:", e);
    }

    const pengValues = [
      ['Key', 'Value'],
      ['teacher_name', data.teacher?.name || ''],
      ['teacher_role', data.teacher?.role || ''],
      ['teacher_school', data.teacher?.school || ''],
      ['semester', data.semester || ''],
      ['schoolType', data.schoolType || '']
    ];

    const kelasValues = [
      ['Nama Kelas'],
      ...(data.classes || []).map((c: string) => [c])
    ];

    const mapelValues = [
      ['ID', 'Nama Mapel', 'KKM', 'Kelas Tersedia'],
      ...(data.subjects || []).map((s: any) => [s.id, s.name, s.kkm, (s.classes || []).join(', ')])
    ];

    const agendaValues = [['Tanggal (Key)', 'Judul', 'Waktu', 'Tipe']];
    Object.entries(data.agendas || {}).forEach(([date, items]: any) => {
      items.forEach((item: any) => agendaValues.push([date, item.title, item.time, item.type]));
    });

    const siswaValues = [
      ['ID', 'Nama Siswa', 'Kelas', 'Jenis Kelamin'],
      ...(data.students || []).map((s: any) => [s.id ? `'${s.id}` : '', s.name, s.class, s.gender])
    ];

    const jadwalValues = [
      ['ID', 'Hari', 'Waktu', 'Kelas', 'Mapel'],
      ...(data.jadwals || []).map((j: any) => [j.id, j.hari, j.waktu, j.kelas, j.mapel])
    ];

    const jurnalValues = [
      ['ID', 'Tanggal', 'Kelas', 'Mapel', 'Topik/Materi', 'Catatan'],
      ...(data.jurnals || []).map((j: any) => [j.id, j.date, j.class, j.mapel, j.topic, j.notes])
    ];

    const hadirValues = [['RecordKey', 'ID', 'Nama Siswa', 'Status', 'Catatan', 'Dikunci']];
    Object.entries(data.attendances || {}).forEach(([key, items]: any) => {
      items.forEach((i: any) => hadirValues.push([key, i.id, i.name, i.status, i.note, i.isLocked ? 'TRUE' : 'FALSE']));
    });

    const nilaiValues = [['RecordKey', 'ID', 'Nama Siswa', 'Nilai (JSON)', 'Dikunci', 'Sikap', 'Karakter']];
    Object.entries(data.grades || {}).forEach(([key, items]: any) => {
      items.forEach((i: any) => nilaiValues.push([key, i.id, i.name, i.nilai, i.isLocked ? 'TRUE' : 'FALSE', i.sikap || '', i.karakter || '']));
    });

    const catatanValues = [
      ['ID', 'Tanggal', 'Nama', 'Kasus', 'Tindak Lanjut', 'Status'],
      ...(data.catatan || []).map((c: any) => [c.id, c.date, c.name, c.issue, c.action, c.status])
    ];

    const reqData = [
      { range: "'Pengaturan'!A1", values: pengValues },
      { range: "'Kelas'!A1", values: kelasValues },
      { range: "'Mapel'!A1", values: mapelValues },
      { range: "'Agenda'!A1", values: agendaValues },
      { range: "'Siswa'!A1", values: siswaValues },
      { range: "'Jadwal'!A1", values: jadwalValues },
      { range: "'Jurnal'!A1", values: jurnalValues },
      { range: "'Kehadiran'!A1", values: hadirValues },
      { range: "'Nilai'!A1", values: nilaiValues },
      { range: "'Catatan'!A1", values: catatanValues }
    ].filter(d => d.values.length > 0);

    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${fileId}/values:batchUpdate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        valueInputOption: "USER_ENTERED",
        data: reqData
      })
    });
    
    if (response.status === 401) {
      throw new Error('Not authenticated');
    }
    if (!response.ok) {
      const errRes = await response.text();
      console.error('Batch update failed:', errRes);
      throw new Error('Failed to update spreadsheet data: ' + errRes);
    }
  } catch (error) {
    console.error("Error saving database:", error);
    throw error;
  }
};

