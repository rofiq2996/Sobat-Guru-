function doPost(e) {
  try {
    var requestData = JSON.parse(e.postData.contents);
    var action = requestData.action;
    var data = requestData.data;

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    if (action === 'save') {
      ensureSheetExists(ss, 'Pengaturan');
      ensureSheetExists(ss, 'Kelas');
      ensureSheetExists(ss, 'Mapel');
      ensureSheetExists(ss, 'Agenda');
      ensureSheetExists(ss, 'Siswa');
      ensureSheetExists(ss, 'Jadwal');
      ensureSheetExists(ss, 'Jurnal');
      ensureSheetExists(ss, 'Kehadiran');
      ensureSheetExists(ss, 'Nilai');
      ensureSheetExists(ss, 'Catatan');

      // 1. Pengaturan
      var pengValues = [
        ['Key', 'Value'],
        ['teacher_name', data.teacher ? data.teacher.name || '' : ''],
        ['teacher_role', data.teacher ? data.teacher.role || '' : ''],
        ['teacher_school', data.teacher ? data.teacher.school || '' : ''],
        ['semester', data.semester || ''],
        ['schoolType', data.schoolType || '']
      ];
      writeToSheet(ss, 'Pengaturan', pengValues);

      // 2. Kelas
      var kelasValues = [['Nama Kelas']];
      if (data.classes) {
        data.classes.forEach(function(c) { kelasValues.push([c]); });
      }
      writeToSheet(ss, 'Kelas', kelasValues);

      // 3. Mapel
      var mapelValues = [['ID', 'Nama Mapel', 'KKM', 'Kelas Tersedia']];
      if (data.subjects) {
        data.subjects.forEach(function(s) { 
          mapelValues.push([s.id, s.name, s.kkm, (s.classes || []).join(', ')]); 
        });
      }
      writeToSheet(ss, 'Mapel', mapelValues);

      // 4. Agenda
      var agendaValues = [['Tanggal (Key)', 'Judul', 'Waktu', 'Tipe']];
      if (data.agendas) {
        Object.keys(data.agendas).forEach(function(date) {
          var items = data.agendas[date];
          if (items) {
            items.forEach(function(item) {
              agendaValues.push([date, item.title, item.time, item.type]);
            });
          }
        });
      }
      writeToSheet(ss, 'Agenda', agendaValues);

      // 5. Siswa
      var siswaValues = [['ID', 'Nama Siswa', 'Kelas', 'Jenis Kelamin']];
      if (data.students) {
        data.students.forEach(function(s) {
          siswaValues.push([s.id ? "'" + s.id : '', s.name, s.class, s.gender]);
        });
      }
      writeToSheet(ss, 'Siswa', siswaValues);

      // 6. Jadwal
      var jadwalValues = [['ID', 'Hari', 'Waktu', 'Kelas', 'Mapel']];
      if (data.jadwals) {
        data.jadwals.forEach(function(j) {
          jadwalValues.push([j.id, j.hari, j.waktu, j.kelas, j.mapel]);
        });
      }
      writeToSheet(ss, 'Jadwal', jadwalValues);

      // 7. Jurnal
      var jurnalValues = [['ID', 'Tanggal', 'Kelas', 'Mapel', 'Topik/Materi', 'Catatan']];
      if (data.jurnals) {
        data.jurnals.forEach(function(j) {
          jurnalValues.push([j.id, j.date, j.class, j.mapel, j.topic, j.notes]);
        });
      }
      writeToSheet(ss, 'Jurnal', jurnalValues);

      // 8. Kehadiran
      var hadirValues = [['RecordKey', 'ID', 'Nama Siswa', 'Status', 'Catatan', 'Dikunci']];
      if (data.attendances) {
        Object.keys(data.attendances).forEach(function(key) {
          var items = data.attendances[key];
          if (items) {
            items.forEach(function(i) {
              hadirValues.push([key, i.id, i.name, i.status, i.note, i.isLocked ? 'TRUE' : 'FALSE']);
            });
          }
        });
      }
      writeToSheet(ss, 'Kehadiran', hadirValues);

      // 9. Nilai
      var nilaiValues = [['RecordKey', 'ID', 'Nama Siswa', 'Nilai (JSON)', 'Dikunci', 'Sikap', 'Karakter']];
      if (data.grades) {
        Object.keys(data.grades).forEach(function(key) {
          var items = data.grades[key];
          if (items) {
            items.forEach(function(i) {
              nilaiValues.push([key, i.id, i.name, i.nilai, i.isLocked ? 'TRUE' : 'FALSE', i.sikap || '', i.karakter || '']);
            });
          }
        });
      }
      writeToSheet(ss, 'Nilai', nilaiValues);
      
      // 10. Catatan Siswa
      var catatanValues = [['ID', 'Tanggal', 'Nama', 'Kasus', 'Tindak Lanjut', 'Status']];
      if (data.catatan) {
        data.catatan.forEach(function(c) {
          catatanValues.push([c.id, c.date, c.name, c.issue, c.action, c.status]);
        });
      }
      writeToSheet(ss, 'Catatan', catatanValues);
      
      return ContentService.createTextOutput(JSON.stringify({ status: 'success' }))
        .setMimeType(ContentService.MimeType.JSON);
    } 
    else if (action === 'read') {
      var result = {
        teacher: {},
        semester: '',
        schoolType: 'umum',
        classes: [],
        subjects: [],
        agendas: {},
        students: [],
        jadwals: [],
        jurnals: [],
        attendances: {},
        grades: {},
        catatan: []
      };

      try { result.teacher = readPengaturan(ss); } catch(e) {}
      try { result.semester = getPengaturanValue(ss, 'semester') || 'Ganjil 2023/2024'; } catch(e) {}
      try { result.schoolType = getPengaturanValue(ss, 'schoolType') || 'umum'; } catch(e) {}
      try { result.classes = readKelas(ss); } catch(e) {}
      try { result.subjects = readMapel(ss); } catch(e) {}
      try { result.agendas = readAgenda(ss); } catch(e) {}
      try { result.students = readSiswa(ss); } catch(e) {}
      try { result.jadwals = readJadwal(ss); } catch(e) {}
      try { result.jurnals = readJurnal(ss); } catch(e) {}
      try { result.attendances = readKehadiran(ss); } catch(e) {}
      try { result.grades = readNilai(ss); } catch(e) {}
      try { result.catatan = readCatatan(ss); } catch(e) {}

      return ContentService.createTextOutput(JSON.stringify({ status: 'success', data: result }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Action tidak dikenal' }))
        .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
        .setMimeType(ContentService.MimeType.JSON);
  }
}

function ensureSheetExists(ss, sheetName) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    ss.insertSheet(sheetName);
  }
}

function writeToSheet(ss, sheetName, values) {
  var sheet = ss.getSheetByName(sheetName);
  if (sheet && values && values.length > 0) {
    sheet.clear();
    sheet.getRange(1, 1, values.length, values[0].length).setValues(values);
  }
}

function getPengaturanValue(ss, key) {
  var sheet = ss.getSheetByName('Pengaturan');
  if (!sheet) return null;
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return null;
  var values = sheet.getRange(2, 1, lastRow - 1, 2).getValues();
  for (var i = 0; i < values.length; i++) {
    if (values[i][0] === key) return values[i][1];
  }
  return null;
}

function readPengaturan(ss) {
  var teacher = { name: '', role: '', school: '' };
  teacher.name = getPengaturanValue(ss, 'teacher_name') || '';
  teacher.role = getPengaturanValue(ss, 'teacher_role') || '';
  teacher.school = getPengaturanValue(ss, 'teacher_school') || '';
  return teacher;
}

function readCatatan(ss) {
  var sheet = ss.getSheetByName('Catatan');
  if (!sheet) return [];
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  var values = sheet.getRange(2, 1, lastRow - 1, 6).getValues();
  var arr = [];
  for (var i = 0; i < values.length; i++) {
    if (values[i][0]) arr.push({ 
      id: Number(values[i][0]), 
      date: String(values[i][1] || ''), 
      name: String(values[i][2] || ''), 
      issue: String(values[i][3] || ''), 
      action: String(values[i][4] || ''), 
      status: String(values[i][5] || '') 
    });
  }
  return arr;
}

function readKelas(ss) {
  var sheet = ss.getSheetByName('Kelas');
  if (!sheet) return [];
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  var values = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  var arr = [];
  for (var i = 0; i < values.length; i++) {
    if (values[i][0]) arr.push(values[i][0].toString());
  }
  return arr;
}

function readMapel(ss) {
  var sheet = ss.getSheetByName('Mapel');
  if (!sheet) return [];
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  var values = sheet.getRange(2, 1, lastRow - 1, 4).getValues();
  var arr = [];
  for (var i = 0; i < values.length; i++) {
    var classes = values[i][3] ? values[i][3].toString().split(',').map(function(s) { return s.trim(); }).filter(Boolean) : [];
    if (values[i][0]) arr.push({ id: values[i][0].toString(), name: values[i][1].toString(), kkm: Number(values[i][2] || 0), classes: classes });
  }
  return arr;
}

function readAgenda(ss) {
  var sheet = ss.getSheetByName('Agenda');
  if (!sheet) return {};
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return {};
  var values = sheet.getRange(2, 1, lastRow - 1, 4).getValues();
  var agendas = {};
  for (var i = 0; i < values.length; i++) {
    var date = values[i][0];
    if (!date) continue;
    date = String(date);
    if (!agendas[date]) agendas[date] = [];
    agendas[date].push({ id: Math.random().toString(), title: String(values[i][1] || ''), time: String(values[i][2] || ''), type: String(values[i][3] || '') });
  }
  return agendas;
}

function readSiswa(ss) {
  var sheet = ss.getSheetByName('Siswa');
  if (!sheet) return [];
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  var values = sheet.getRange(2, 1, lastRow - 1, 4).getValues();
  var arr = [];
  for (var i = 0; i < values.length; i++) {
    if (values[i][1]) { // Nama exists
      var id = values[i][0] != null ? String(values[i][0]).replace(/^'/, '') : '';
      arr.push({ id: id, name: String(values[i][1]), class: String(values[i][2] || ''), gender: String(values[i][3] || '') });
    }
  }
  return arr;
}

function readJadwal(ss) {
  var sheet = ss.getSheetByName('Jadwal');
  if (!sheet) return [];
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  var values = sheet.getRange(2, 1, lastRow - 1, 5).getValues();
  var arr = [];
  for (var i = 0; i < values.length; i++) {
    if (values[i][0]) arr.push({ id: String(values[i][0]), hari: String(values[i][1] || ''), waktu: String(values[i][2] || ''), kelas: String(values[i][3] || ''), mapel: String(values[i][4] || '') });
  }
  return arr;
}

function readJurnal(ss) {
  var sheet = ss.getSheetByName('Jurnal');
  if (!sheet) return [];
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  var values = sheet.getRange(2, 1, lastRow - 1, 6).getValues();
  var arr = [];
  for (var i = 0; i < values.length; i++) {
    if (values[i][0]) arr.push({ id: String(values[i][0]), date: String(values[i][1] || ''), class: String(values[i][2] || ''), mapel: String(values[i][3] || ''), topic: String(values[i][4] || ''), notes: String(values[i][5] || '') });
  }
  return arr;
}

function readKehadiran(ss) {
  var sheet = ss.getSheetByName('Kehadiran');
  if (!sheet) return {};
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return {};
  var values = sheet.getRange(2, 1, lastRow - 1, 6).getValues();
  var att = {};
  for (var i = 0; i < values.length; i++) {
    var key = String(values[i][0]);
    if (!key) continue;
    if (!att[key]) att[key] = [];
    att[key].push({ id: Number(values[i][1] || 0), name: String(values[i][2] || ''), status: String(values[i][3] || ''), note: String(values[i][4] || ''), isLocked: String(values[i][5]).toUpperCase() === 'TRUE' });
  }
  return att;
}

function readNilai(ss) {
  var sheet = ss.getSheetByName('Nilai');
  if (!sheet) return {};
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return {};
  var values = sheet.getRange(2, 1, lastRow - 1, 7).getValues();
  var grades = {};
  for (var i = 0; i < values.length; i++) {
    var key = String(values[i][0]);
    if (!key) continue;
    if (!grades[key]) grades[key] = [];
    grades[key].push({ id: Number(values[i][1] || 0), name: String(values[i][2] || ''), nilai: String(values[i][3] || ''), isLocked: String(values[i][4]).toUpperCase() === 'TRUE', sikap: String(values[i][5] || ''), karakter: String(values[i][6] || '') });
  }
  return grades;
}

function doGet(e) {
  return ContentService.createTextOutput("Aplikasi Backend GuruInAja Berjalan Normal.")
    .setMimeType(ContentService.MimeType.TEXT);
}
