const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardView.tsx', 'utf-8');

// Update useAppContext to include jurnals and catatan
code = code.replace(
  "const { teacher, classes, subjects, students, attendances, user } = useAppContext();",
  "const { teacher, classes, subjects, students, attendances, user, jurnals, catatan } = useAppContext();"
);

// Define activities array
const activitiesCode = `
  const activities = [
    ...(jurnals || []).map(j => ({ id: j.id, type: 'jurnal', title: 'Jurnal Ajar', desc: \`\${j.class} - \${j.mapel}\`, time: j.date })),
    ...(catatan || []).map(c => ({ id: c.id, type: 'catatan', title: 'Catatan Kasus', desc: c.name, time: c.date }))
  ].sort((a, b) => b.id - a.id).slice(0, 10);
`;

code = code.replace(
  "const formattedDate = currentTime.toLocaleDateString",
  activitiesCode + "\n  const formattedDate = currentTime.toLocaleDateString"
);

// Replace the placeholder content
const listCode = `
            {activities.length > 0 ? (
              <div className="space-y-4">
                {activities.map((act) => (
                  <div key={\`\${act.type}-\${act.id}\`} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
                    <div className={\`w-8 h-8 rounded-full flex items-center justify-center shrink-0 \${
                      act.type === 'jurnal' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                      'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400'
                    }\`}>
                      {act.type === 'jurnal' ? <BookText className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{act.title}</p>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{act.desc}</p>
                    </div>
                    <div className="text-[10px] font-medium text-slate-400 shrink-0 mt-1">
                      {act.time}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500 py-10">
                <Activity className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-xs font-medium">Belum ada aktivitas terbaru</p>
              </div>
            )}
`;

code = code.replace(
  /<div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500 py-10">[\s\S]*?<\/div>/,
  listCode
);

fs.writeFileSync('src/components/DashboardView.tsx', code);
