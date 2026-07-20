const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf-8');

const oldCode = `      try {
        data = await readDatabase(currentSpreadsheetUrl);
      } catch (err) {
        console.warn("Drive DB failed, trying Firestore", err);
      }
      
      if (data) {`;

const newCode = `      try {
        data = await readDatabase(currentSpreadsheetUrl);
      } catch (err) {
        console.warn("Drive DB failed, trying Firestore", err);
      }
      
      if (!data && userSnap && userSnap.exists()) {
        const userData = userSnap.data();
        if (userData.appData) {
           data = userData.appData;
           console.log("Loaded data from Firestore appData");
        }
      }
      
      if (data) {`;

code = code.replace(oldCode, newCode);
fs.writeFileSync('src/context/AppContext.tsx', code);
