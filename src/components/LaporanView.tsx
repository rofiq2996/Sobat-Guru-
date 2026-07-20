import { Download, FileBox, FileText, FileSpreadsheet, Eye, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { SelectDropdown } from './ui/SelectDropdown';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getDirectImageUrl } from '../lib/utils';

import * as XLSX from 'xlsx-js-style';

export function LaporanView() {
  const { classes, teacher, subjects, semester, students, attendances, grades, jurnals, catatan } = useAppContext();
  const [selectedClass, setSelectedClass] = useState(classes[0] || '');
  const [nilaiDownloadType, setNilaiDownloadType] = useState<'PTS' | 'AKHIR'>('PTS');
  
  // Absensi Date Range
  const [absensiStartDate, setAbsensiStartDate] = useState('');
  const [absensiEndDate, setAbsensiEndDate] = useState('');

  // Preview State
  const [previewData, setPreviewData] = useState<any>(null);
  const [previewTitle, setPreviewTitle] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [pdfOrientation, setPdfOrientation] = useState<'portrait' | 'landscape'>('portrait');

  useEffect(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    setAbsensiStartDate(firstDay.toISOString().split('T')[0]);
    setAbsensiEndDate(today.toISOString().split('T')[0]);
  }, []);

  const getReportData = (title: string, downloadType?: 'PTS' | 'AKHIR') => {
    if (title === 'Laporan Absensi Bulanan') {
      let reportTitle = 'Laporan Absensi';
      let sheetName = 'Absensi';
      
      if (absensiStartDate && absensiEndDate) {
        const start = new Date(absensiStartDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
        const end = new Date(absensiEndDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
        reportTitle = `Laporan Absensi Tanggal ${start} Sampai ${end}`;
        sheetName = `${new Date(absensiStartDate).toLocaleDateString('id-ID', { month: 'short' })} - ${new Date(absensiEndDate).toLocaleDateString('id-ID', { month: 'short' })}`;
      }

      const classStudents = students.filter(s => s.class.trim().toLowerCase() === selectedClass.trim().toLowerCase());
      
      const body = classStudents.map((student, i) => {
        let hadir = 0;
        let sakit = 0;
        let izin = 0;
        let alpa = 0;
        
        Object.keys(attendances).forEach(key => {
           if (key.startsWith(`${selectedClass}_`)) {
             const dateStr = key.split('_')[1];
             if (dateStr) {
               const dateObj = new Date(dateStr);
               const startObj = new Date(absensiStartDate);
               const endObj = new Date(absensiEndDate);
               if (dateObj >= startObj && dateObj <= endObj) {
                  const attRec = attendances[key].find(a => a.name === student.name);
                  if (attRec) {
                    if (attRec.status === 'Hadir') hadir++;
                    else if (attRec.status === 'Sakit') sakit++;
                    else if (attRec.status === 'Izin') izin++;
                    else if (attRec.status === 'Alpa') alpa++;
                  }
               }
             }
           }
        });
        return [i + 1, student.name, hadir, sakit, izin, alpa];
      });

      return {
        isMultiSheet: false,
        head: ['No', 'Nama Siswa', 'Hadir', 'Sakit', 'Izin', 'Alpa'],
        body,
        title: reportTitle,
      };
    } else if (title === 'Laporan Nilai Ulangan') {
      const classSubjects = subjects.filter(s => s.classes.some(c => c.trim().toLowerCase() === selectedClass.trim().toLowerCase()));
      
      let mapels = classSubjects.map(s => s.name);
      
      if (mapels.length === 0) {
          mapels = ['Matematika', 'B. Indonesia'];
      }

      const ptsName = semester === 'Ganjil' ? 'PTS 1' : 'PTS 2';
      const akhirName = semester === 'Ganjil' ? 'SAS' : 'SAT';

      return {
        isMultiSheet: true,
        sheets: mapels.map(mapel => {
          let head, body;
          const classStudents = students.filter(s => s.class.trim().toLowerCase() === selectedClass.trim().toLowerCase());

          if (downloadType === 'PTS') {
            head = ['No', 'Nama Siswa', 'L/P', ptsName];
            const ptsKey = `${selectedClass}_${mapel}_${ptsName}`;
            body = classStudents.map((s, i) => {
               const rec = grades[ptsKey]?.find(g => g.name === s.name);
               return [i + 1, s.name, s.gender, rec && rec.nilai !== '' ? rec.nilai : '-'];
            });
          } else {
            head = ['No', 'Nama Siswa', 'L/P', 'UH 1', 'UH 2', 'UH 3', ptsName, akhirName, 'Rata-Rata'];
            const uh1Key = `${selectedClass}_${mapel}_UH 1`;
            const uh2Key = `${selectedClass}_${mapel}_UH 2`;
            const uh3Key = `${selectedClass}_${mapel}_UH 3`;
            const ptsKey = `${selectedClass}_${mapel}_${ptsName}`;
            const akhirKey = `${selectedClass}_${mapel}_${akhirName}`;
            
            body = classStudents.map((s, i) => {
               const uh1 = grades[uh1Key]?.find(g => g.name === s.name)?.nilai || '-';
               const uh2 = grades[uh2Key]?.find(g => g.name === s.name)?.nilai || '-';
               const uh3 = grades[uh3Key]?.find(g => g.name === s.name)?.nilai || '-';
               const pts = grades[ptsKey]?.find(g => g.name === s.name)?.nilai || '-';
               const akhir = grades[akhirKey]?.find(g => g.name === s.name)?.nilai || '-';
               
               const vals = [uh1, uh2, uh3, pts, akhir].map(v => Number(v)).filter(v => !isNaN(v) && v !== 0 && String(v) !== '');
               const avg = vals.length > 0 ? (vals.reduce((a,b)=>a+b,0) / vals.length).toFixed(1) : '-';

               return [i + 1, s.name, s.gender, uh1, uh2, uh3, pts, akhir, avg];
            });
          }
          return {
            sheetName: mapel.substring(0, 31),
            title: `Nilai Mapel ${mapel} - ${downloadType === 'PTS' ? ptsName : akhirName}`,
            head,
            body
          };
        })
      };
    } else if (title === 'Laporan Analisis Belajar Siswa') {
      const classSubjects = subjects.filter(s => s.classes.some(c => c.trim().toLowerCase() === selectedClass.trim().toLowerCase()));
      
      let mapels = classSubjects.map(s => s.name);
      
      if (mapels.length === 0) {
          mapels = ['Matematika', 'B. Indonesia'];
      }

      return {
        isMultiSheet: true,
        sheets: mapels.map(mapel => {
          const classStudents = students.filter(s => s.class.trim().toLowerCase() === selectedClass.trim().toLowerCase());
          
          const ptsName = semester === 'Ganjil' ? 'PTS 1' : 'PTS 2';
          const akhirName = semester === 'Ganjil' ? 'SAS' : 'SAT';

          const body = classStudents.map((s, i) => {
             const uh1 = grades[`${selectedClass}_${mapel}_UH 1`]?.find(g => g.name === s.name)?.nilai || '-';
             const uh2 = grades[`${selectedClass}_${mapel}_UH 2`]?.find(g => g.name === s.name)?.nilai || '-';
             const uh3 = grades[`${selectedClass}_${mapel}_UH 3`]?.find(g => g.name === s.name)?.nilai || '-';
             const pts = grades[`${selectedClass}_${mapel}_${ptsName}`]?.find(g => g.name === s.name)?.nilai || '-';
             const akhir = grades[`${selectedClass}_${mapel}_${akhirName}`]?.find(g => g.name === s.name)?.nilai || '-';
             
             const uhVals = [uh1, uh2, uh3].map(v => Number(v)).filter(v => !isNaN(v) && String(v) !== '');
             const uhAvg = uhVals.length > 0 ? (uhVals.reduce((a,b)=>a+b,0) / uhVals.length).toFixed(1) : '-';
             
             let ket = '-';
             if (akhir !== '-' && pts !== '-' && akhir !== '' && pts !== '') {
                if (Number(akhir) > Number(pts)) ket = 'Meningkat';
                else if (Number(akhir) < Number(pts)) ket = 'Menurun';
                else ket = 'Stabil';
             }

             return [i + 1, s.name, s.gender, uhAvg, pts, akhir, ket];
          });

          return {
            sheetName: mapel.substring(0, 31),
            title: `Analisis Belajar Siswa - ${mapel}`,
            head: ['No', 'Nama Siswa', 'L/P', 'Nilai UH Rata-rata', 'Nilai PTS', 'Nilai Akhir Semester', 'Keterangan Perkembangan'],
            body
          };
        })
      };
    } else if (title === 'Laporan Jurnal Mengajar') {
      const classJurnals = jurnals.filter(j => j.class.trim().toLowerCase() === selectedClass.trim().toLowerCase());
      return {
        head: ['No', 'Tanggal', 'Mata Pelajaran', 'Topik/Materi', 'Kegiatan/Catatan'],
        body: classJurnals.map((j, i) => [i + 1, j.date, j.mapel, j.topic, j.notes])
      };
    } else {
      const classStudents = students.filter(s => s.class.trim().toLowerCase() === selectedClass.trim().toLowerCase());
      const classStudentNames = classStudents.map(s => s.name);
      const classCatatan = catatan.filter(c => classStudentNames.includes(c.name));
      return {
        head: ['No', 'Tanggal', 'Nama Siswa', 'Kasus', 'Tindak Lanjut', 'Status'],
        body: classCatatan.map((c, i) => [i + 1, c.date, c.name, c.issue, c.action, c.status])
      };
    }
  };

  const handleDownloadExcel = (title: string) => {
    const data = getReportData(title, title === 'Laporan Nilai Ulangan' ? nilaiDownloadType : undefined) as any;
    const wb = XLSX.utils.book_new();
    const currentDate = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });

    const fitToColumnShifted = (aoa: any[][], hasTitle: boolean, numDataRows: number, shiftRows: number) => {
      if (!aoa || aoa.length === 0) return [];
      const headerRowIndex = shiftRows; // The actual header row
      if (aoa.length <= headerRowIndex) return [];
      
      const headerRow = aoa[headerRowIndex];
      const colWidths = headerRow.map((col: any, colIndex: number) => {
        const headerTitle = col?.toString() || '';
        let extraPad = 2;
        if (headerTitle === 'Nama Siswa' || headerTitle === 'Nama') extraPad = 12;
        if (headerTitle === 'No') extraPad = 1; // Not too wide

        const maxWidth = Math.max(...aoa.map((row, rowIndex) => {
          if (rowIndex < shiftRows) return 0; // Skip kop, empty, title, empty
          if (rowIndex > shiftRows + numDataRows) return 0; // Skip signature rows
          const cellValue = row[colIndex];
          return cellValue ? cellValue.toString().length : 0;
        }));
        
        if (headerTitle === 'No' || headerTitle === 'No.') {
           return 5; // Fixed small width for No column in Excel
        }
        
        return maxWidth + extraPad;
      });
      return colWidths.map(width => ({ wch: width }));
    };

    const applyStylesShifted = (ws: any, numCols: number, numDataRows: number, shiftRows: number, headerRow: string[]) => {
      if (!ws['!ref']) return;
      const range = XLSX.utils.decode_range(ws['!ref']);
      
      ws['!merges'] = ws['!merges'] || [];

      const sigColIdx = Math.max(0, numCols - 3);
      const dataEndRow = shiftRows + numDataRows; 
      const sigStartRow = dataEndRow + 2; 
      ws['!merges'].push({ s: { r: sigStartRow, c: sigColIdx }, e: { r: sigStartRow, c: numCols - 1 } });
      ws['!merges'].push({ s: { r: sigStartRow + 1, c: sigColIdx }, e: { r: sigStartRow + 1, c: numCols - 1 } });
      ws['!merges'].push({ s: { r: sigStartRow + 5, c: sigColIdx }, e: { r: sigStartRow + 5, c: numCols - 1 } });

      for (let R = shiftRows - 2; R <= range.e.r; ++R) { // Start from title row (shifted)
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cell_address = { c: C, r: R };
          const cell_ref = XLSX.utils.encode_cell(cell_address);
          
          if (!ws[cell_ref]) ws[cell_ref] = { t: 's', v: '' };

          if (R === shiftRows - 2) {
            // Title row
            ws[cell_ref].s = {
              font: { name: 'Arial', color: { rgb: '000000' }, bold: true, sz: 14 },
              alignment: { horizontal: 'center', vertical: 'center' }
            };
          } else if (R === shiftRows - 1) {
            // Empty spacer row between Title and Header - wait, header is at `shiftRows`! 
            // My wsData construction: kop (0-4), empty(5), title(6), empty(7), head(8). 
            // Thus, shiftRows is 8! Title is at 6 (shiftRows - 2). Empty is 7 (shiftRows - 1). Header is 8.
          } else {
            const isHeaderRow = R === shiftRows;
            
            if (R > dataEndRow) {
              const isTeacherName = R === sigStartRow + 5;
              ws[cell_ref].s = {
                font: { name: 'Arial', color: { rgb: '000000' }, bold: isTeacherName },
                alignment: C >= sigColIdx ? { horizontal: 'center' } : undefined
              };
              continue;
            }

            ws[cell_ref].s = {
              border: {
                top: { style: 'thin', color: { rgb: 'CBD5E1' } },
                bottom: { style: 'thin', color: { rgb: 'CBD5E1' } },
                left: { style: 'thin', color: { rgb: 'CBD5E1' } },
                right: { style: 'thin', color: { rgb: 'CBD5E1' } }
              },
              font: {
                name: 'Arial',
                color: { rgb: '334155' },
                bold: isHeaderRow,
                sz: 10
              }
            };
            
            // Alignment logic
            if (isHeaderRow) {
              ws[cell_ref].s.alignment = { horizontal: 'center', vertical: 'center' };
            } else {
              const headerTitle = headerRow[C] || '';
              if (['No', 'L/P', 'S', 'I', 'A', 'Jam Ke'].includes(headerTitle) || headerTitle.match(/UH|PTS|STS|SAS|SAT|Rata-Rata/i) || !isNaN(Number(headerTitle))) {
                ws[cell_ref].s.alignment = { horizontal: 'center', vertical: 'center' };
              } else {
                ws[cell_ref].s.alignment = { horizontal: 'left', vertical: 'center' };
              }
            }

            if (isHeaderRow) {
              ws[cell_ref].s.fill = {
                patternType: 'solid',
                fgColor: { rgb: 'F1F5F9' } // bg-slate-100
              };
            }
          }
        }
      }
    };

    const getSignatureRows = (numCols: number) => {
      const sigColIdx = numCols - 3 >= 0 ? numCols - 3 : 0;
      const emptyRow = new Array(numCols).fill('');
      const dateRow = new Array(numCols).fill('');
      dateRow[sigColIdx] = `Pekanbaru, ${currentDate}`;
      const roleRow = new Array(numCols).fill('');
      roleRow[sigColIdx] = 'Guru Mata Pelajaran';
      const nameRow = new Array(numCols).fill('');
      nameRow[sigColIdx] = teacher.name;
      return [emptyRow, dateRow, roleRow, emptyRow, emptyRow, emptyRow, nameRow];
    };

    if (data.isMultiSheet) {
      data.sheets.forEach((sheet: any) => {
        const titleText = `${sheet.title} - ${selectedClass}`;
        const titleRow = new Array(sheet.head.length).fill('');
        titleRow[0] = titleText;
        const sigRows = getSignatureRows(sheet.head.length);
        const wsData = [
          titleRow,
          [],
          sheet.head,
          ...sheet.body,
          ...sigRows
        ];
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        ws['!cols'] = fitToColumnShifted(wsData, true, sheet.body.length, 2);
        
        ws['!merges'] = ws['!merges'] || [];
        // Merge Title
        ws['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: sheet.head.length - 1 } });

        ws['!rows'] = [];
        ws['!rows'][2] = { hpt: 30 }; // Header row height (after Title and empty row)
        
        // Use applyStyles but shifted
        applyStylesShifted(ws, sheet.head.length, sheet.body.length, 2, sheet.head);
        
        XLSX.utils.book_append_sheet(wb, ws, sheet.sheetName);
      });
    } else {
      const titleText = `${title} - ${selectedClass}`;
      const titleRow = new Array(data.head.length).fill('');
      titleRow[0] = titleText;
      const sigRows = getSignatureRows(data.head.length);
      const wsData = [
        titleRow,
        [],
        data.head,
        ...data.body,
        ...sigRows
      ];
      
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      ws['!cols'] = fitToColumnShifted(wsData, true, data.body.length, 2);
      
      ws['!merges'] = ws['!merges'] || [];
      // Merge Title
      ws['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: data.head.length - 1 } });

      ws['!rows'] = [];
      ws['!rows'][2] = { hpt: 30 }; // Header row height (after Title and empty row)
      
      applyStylesShifted(ws, data.head.length, data.body.length, 2, data.head);
      XLSX.utils.book_append_sheet(wb, ws, "Laporan");
    }
    
    XLSX.writeFile(wb, `${title} ${selectedClass}.xlsx`);
  };

  const loadImageBase64 = (url: string): Promise<string> => {
    return new Promise((resolve) => {
      if (!url) {
        resolve('');
        return;
      }
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png'));
            return;
          }
        } catch (e) {
          console.error("Error drawing image to canvas", e);
        }
        resolve('');
      };
      img.onerror = () => {
        resolve('');
      };
      img.src = url;
    });
  };

  const drawPdfKopSurat = (doc: jsPDF, pageWidth: number) => {
    let y = 20;
    
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(teacher.school || 'NAMA SEKOLAH', pageWidth / 2, y, { align: 'center' });
    
    // Draw line limit (satu tebal, satu tipis)
    y += 6;
    doc.setLineWidth(1.0);
    doc.line(14, y, pageWidth - 14, y);
    doc.setLineWidth(0.2);
    doc.line(14, y + 1.5, pageWidth - 14, y + 1.5);

    return y + 10; // return next Y start
  };

  const handleDownloadPdf = async (title: string) => {
    const data = getReportData(title, title === 'Laporan Nilai Ulangan' ? nilaiDownloadType : undefined) as any;
    const doc = new jsPDF({ orientation: pdfOrientation });
    const pageWidth = doc.internal.pageSize.getWidth();
    const currentDate = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
    
    doc.setFont("helvetica");
    doc.setTextColor(0, 0, 0); 
    
    const addSignature = (finalY: number) => {
      const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
      let y = finalY + 15;
      if (y + 30 > pageHeight) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Pekanbaru, ${currentDate}`, pageWidth - 60, y);
      doc.text('Guru Mata Pelajaran', pageWidth - 60, y + 5);
      doc.setFont('helvetica', 'bold');
      doc.text(teacher.name, pageWidth - 60, y + 25);
    };

    if (data.isMultiSheet) {
      data.sheets.forEach((sheet: any, index: number) => {
        if (index > 0) doc.addPage();
        
        let startY = drawPdfKopSurat(doc, pageWidth);
        
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(`${sheet.title} - ${selectedClass}`, pageWidth / 2, startY, { align: 'center' });
        
        autoTable(doc, {
          startY: startY + 8,
          head: [sheet.head],
          body: sheet.body,
          theme: 'grid',
          styles: { font: 'helvetica', textColor: [51, 65, 85], fontSize: 10, cellPadding: 3, lineColor: [203, 213, 225], lineWidth: 0.1 },
          headStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold', minCellHeight: 12, valign: 'middle', halign: 'center' },
          columnStyles: {
            0: { cellWidth: 8 } // No
          },
          didParseCell: function (dataState) {
             const headerText = sheet.head[dataState.column.index];
             if (dataState.section === 'body') {
               if (['No', 'L/P', 'S', 'I', 'A', 'Jam Ke'].includes(headerText) || headerText?.match(/UH|PTS|STS|SAS|SAT|Rata-Rata/i) || !isNaN(Number(headerText))) {
                   dataState.cell.styles.halign = 'center';
               }
             }
          }
        });
        
        addSignature((doc as any).lastAutoTable.finalY);
      });
    } else {
      let startY = drawPdfKopSurat(doc, pageWidth);
      
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(`${title} - ${selectedClass}`, pageWidth / 2, startY, { align: 'center' });
      
      autoTable(doc, {
        startY: startY + 8,
        head: [data.head],
        body: data.body,
        theme: 'grid',
        styles: { font: 'helvetica', textColor: [51, 65, 85], fontSize: 10, cellPadding: 3, lineColor: [203, 213, 225], lineWidth: 0.1 },
        headStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold', minCellHeight: 12, valign: 'middle', halign: 'center' },
        columnStyles: {
          0: { cellWidth: 8 } // No
        },
        didParseCell: function (dataState) {
           const headerText = data.head[dataState.column.index];
           if (dataState.section === 'body') {
             if (['No', 'L/P', 'S', 'I', 'A', 'Jam Ke'].includes(headerText) || headerText?.match(/UH|PTS|STS|SAS|SAT|Rata-Rata/i) || !isNaN(Number(headerText))) {
                 dataState.cell.styles.halign = 'center';
             }
           }
        }
      });

      addSignature((doc as any).lastAutoTable.finalY);
    }
    
    doc.save(`${title} ${selectedClass}.pdf`);
  };

  const handlePreview = (title: string) => {
    const data = getReportData(title, title === 'Laporan Nilai Ulangan' ? nilaiDownloadType : undefined) as any;
    setPreviewData(data);
    setPreviewTitle(title);
    setShowPreview(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-8 max-w-4xl mx-auto">
      {/* Preview Modal */}
      {showPreview && previewData && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-slate-900 rounded-none sm:rounded-2xl shadow-xl w-full max-w-5xl h-[100dvh] sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-lg text-slate-800 dark:text-white truncate pr-2">Preview: {previewTitle}</h3>
              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                <button onClick={() => handleDownloadExcel(previewTitle)} className="bg-green-50 text-green-700 px-2 sm:px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-green-100 flex items-center gap-1.5 hidden sm:flex">
                  <FileSpreadsheet className="w-4 h-4" /> Excel
                </button>
                <button onClick={() => handleDownloadPdf(previewTitle)} className="bg-rose-50 text-rose-700 px-2 sm:px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-rose-100 flex items-center gap-1.5 hidden sm:flex">
                  <FileText className="w-4 h-4" /> PDF
                </button>
                <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>
                <button onClick={() => setShowPreview(false)} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto p-2 sm:p-6 bg-slate-100/50 dark:bg-slate-950 custom-scrollbar">
              <div className="bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 sm:rounded-xl p-4 sm:p-10 w-full max-w-4xl mx-auto">
                {/* Kop Surat Preview */}
                <div className="flex flex-col items-center justify-center pb-4 mb-6 relative">
                  <h1 className="font-black text-2xl uppercase tracking-wide my-1 text-center">{teacher.school || 'NAMA SEKOLAH'}</h1>
                  
                  {/* Double line for Kop Surat (Thick + Thin) */}
                  <div className="absolute bottom-0 left-0 right-0">
                    <div className="border-b-[3px] border-slate-900 dark:border-slate-100 mb-[2px]"></div>
                    <div className="border-b-[1px] border-slate-900 dark:border-slate-100"></div>
                  </div>
                </div>

                {previewData.isMultiSheet ? (
                  <div className="space-y-12">
                    {previewData.sheets.map((sheet: any, idx: number) => (
                      <div key={idx} className="space-y-4">
                        <h4 className="text-center font-bold text-lg uppercase">{sheet.title} - {selectedClass}</h4>
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse border border-slate-300 dark:border-slate-700 text-sm">
                            <thead>
                              <tr className="bg-slate-100 dark:bg-slate-800">
                                {sheet.head.map((h: string, i: number) => (
                                  <th key={i} className={`border border-slate-300 dark:border-slate-700 px-3 py-2 text-center font-bold ${h === 'No' ? 'w-12' : ''}`}>
                                    {h}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {sheet.body.map((row: string[], i: number) => (
                                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                  {row.map((cell: string, j: number) => {
                                    const headerTitle = sheet.head[j];
                                    const isCenter = ['No', 'L/P', 'S', 'I', 'A', 'Jam Ke'].includes(headerTitle) || headerTitle?.match(/UH|PTS|STS|SAS|SAT|Rata-Rata/i) || !isNaN(Number(headerTitle));
                                    return (
                                      <td key={j} className={`border border-slate-300 dark:border-slate-700 px-3 py-1.5 ${isCenter ? 'text-center' : 'text-left'}`}>
                                        {cell}
                                      </td>
                                    );
                                  })}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h4 className="text-center font-bold text-lg uppercase">{previewTitle} - {selectedClass}</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-slate-300 dark:border-slate-700 text-sm">
                        <thead>
                          <tr className="bg-slate-100 dark:bg-slate-800">
                            {previewData.head.map((h: string, i: number) => (
                              <th key={i} className={`border border-slate-300 dark:border-slate-700 px-3 py-2 text-center font-bold ${h === 'No' ? 'w-12' : ''}`}>
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {previewData.body.map((row: string[], i: number) => (
                            <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                              {row.map((cell: string, j: number) => {
                                const headerTitle = previewData.head[j];
                                const isCenter = ['No', 'L/P', 'S', 'I', 'A', 'Jam Ke'].includes(headerTitle) || headerTitle?.match(/UH|PTS|STS|SAS|SAT|Rata-Rata/i) || !isNaN(Number(headerTitle));
                                return (
                                  <td key={j} className={`border border-slate-300 dark:border-slate-700 px-3 py-1.5 ${isCenter ? 'text-center' : 'text-left'}`}>
                                    {cell}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                
                <div className="mt-16 flex justify-end">
                  <div className="text-center w-48">
                    <p className="text-sm mb-1">Pekanbaru, {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p className="text-sm mb-16">Guru Mata Pelajaran</p>
                    <p className="font-bold underline">{teacher.name}</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Mobile Actions */}
            <div className="sm:hidden p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-2 w-full shrink-0">
                <button onClick={() => handleDownloadExcel(previewTitle)} className="flex-1 bg-green-50 text-green-700 px-3 py-2.5 rounded-xl text-sm font-bold hover:bg-green-100 flex items-center justify-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4" /> Excel
                </button>
                <button onClick={() => handleDownloadPdf(previewTitle)} className="flex-1 bg-rose-50 text-rose-700 px-3 py-2.5 rounded-xl text-sm font-bold hover:bg-rose-100 flex items-center justify-center gap-1.5">
                  <FileText className="w-4 h-4" /> PDF
                </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Laporan Cetak</h2>
          <p className="text-sm text-slate-500">Unduh laporan akademik dan absensi</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="w-full sm:w-40">
            <SelectDropdown 
              value={selectedClass}
              onChange={setSelectedClass}
              options={classes.map(c => ({ value: c, label: c }))}
            />
          </div>
          <div className="w-full sm:w-40">
            <SelectDropdown 
              value={pdfOrientation}
              onChange={(val) => setPdfOrientation(val as 'portrait' | 'landscape')}
              options={[
                { value: 'portrait', label: 'PDF Potrait' },
                { value: 'landscape', label: 'PDF Landscape' }
              ]}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { title: 'Laporan Absensi Bulanan', desc: 'Rekap kehadiran siswa per bulan' },
          { title: 'Laporan Nilai Ulangan', desc: 'Rekap nilai semua mata pelajaran' },
          { title: 'Laporan Analisis Belajar Siswa', desc: 'Rekap perkembangan hasil belajar siswa per mata pelajaran' },
          { title: 'Laporan Jurnal Mengajar', desc: 'Rekap jurnal kegiatan belajar mengajar' },
          { title: 'Laporan Catatan Siswa', desc: 'Rekap khusus kasus dan tindak lanjut siswa' },
        ].map((item, id) => (
          <div key={id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between items-start h-full">
            <div className="flex items-start gap-4 w-full">
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-[#0f6c46] dark:text-primary-400">
                <FileBox className="w-6 h-6" />
              </div>
              <div className="flex-1 w-full min-w-0">
                <h3 className="font-bold text-slate-800 dark:text-white truncate">{item.title}</h3>
                <p className="text-sm text-slate-500 mt-1 mb-4">{item.desc}</p>
                {item.title === 'Laporan Absensi Bulanan' && (
                  <div className="mb-4 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <input 
                        type="date" 
                        value={absensiStartDate} 
                        onChange={(e) => setAbsensiStartDate(e.target.value)}
                        className="flex-1 min-w-0 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-2 text-xs sm:text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all font-medium text-slate-700 dark:text-slate-300"
                        title="Tanggal Mulai"
                      />
                      <span className="text-slate-400 font-medium">-</span>
                      <input 
                        type="date" 
                        value={absensiEndDate} 
                        onChange={(e) => setAbsensiEndDate(e.target.value)}
                        className="flex-1 min-w-0 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-2 text-xs sm:text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all font-medium text-slate-700 dark:text-slate-300"
                        title="Tanggal Akhir"
                      />
                    </div>
                  </div>
                )}
                {item.title === 'Laporan Nilai Ulangan' && (
                  <div className="mb-4 relative z-50">
                    <SelectDropdown
                      value={nilaiDownloadType}
                      onChange={(val) => setNilaiDownloadType(val as 'PTS' | 'AKHIR')}
                      options={[
                        { value: 'PTS', label: 'Nilai PTS Saja' },
                        { value: 'AKHIR', label: 'Nilai Keseluruhan (SAS/SAT)' }
                      ]}
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="w-full mt-auto flex flex-col xl:flex-row gap-2">
              <button 
                onClick={() => handlePreview(item.title)}
                className="w-full xl:flex-1 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 font-medium py-2 px-3 rounded-xl transition-colors border border-indigo-200 dark:border-indigo-800/50 flex items-center justify-center gap-1.5 text-sm"
              >
                <Eye className="w-4 h-4" /> Preview
              </button>
              <div className="w-full xl:flex-1 flex gap-2">
                <button 
                  onClick={() => handleDownloadExcel(item.title)}
                  className="flex-1 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40 text-green-700 dark:text-green-400 font-medium py-2 px-3 rounded-xl transition-colors border border-green-200 dark:border-green-800/50 flex items-center justify-center gap-1.5 text-sm"
                >
                  <FileSpreadsheet className="w-4 h-4" /> Excel
                </button>
                <button 
                  onClick={() => handleDownloadPdf(item.title)}
                  className="flex-1 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/20 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-400 font-medium py-2 px-3 rounded-xl transition-colors border border-rose-200 dark:border-rose-800/50 flex items-center justify-center gap-1.5 text-sm"
                >
                  <FileText className="w-4 h-4" /> PDF
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
