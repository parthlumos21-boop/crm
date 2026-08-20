const mongoose = require('mongoose');
const fs = require('fs');

async function importDB() {
  try {
    if (!fs.existsSync('crm_db_export.json')) {
      console.error('Error: crm_db_export.json not found in this folder!');
      process.exit(1);
    }
    
    const fileContent = fs.readFileSync('crm_db_export.json', 'utf8');
    const importData = JSON.parse(fileContent);
    
    await mongoose.connect('mongodb://127.0.0.1:27017/crm');
    console.log('Connected to new local MongoDB...');
    
    const db = mongoose.connection.db;
    
    for (const [colName, documents] of Object.entries(importData)) {
      console.log(`Importing ${documents.length} documents into collection: ${colName}`);
      if (documents.length > 0) {
        // Drop the collection if it exists to ensure a perfectly clean import
        try { await db.collection(colName).drop(); } catch (e) { /* ignore if doesn't exist */ }
        
        // Insert all documents
        await db.collection(colName).insertMany(documents);
      }
    }
    
    console.log('Database successfully imported on the new device!');
    process.exit(0);
  } catch (err) {
    console.error('Import failed:', err);
    process.exit(1);
  }
}

importDB();
