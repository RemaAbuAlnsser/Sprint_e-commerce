const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config();

async function exportDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'SprintDB',
      port: process.env.DB_PORT || 3306,
    });

    console.log('Connected to database...');

    let sqlDump = `-- Sprint E-Commerce Database Export\n`;
    sqlDump += `-- Generated on: ${new Date().toISOString()}\n\n`;
    sqlDump += `CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'SprintDB'};\n`;
    sqlDump += `USE ${process.env.DB_NAME || 'SprintDB'};\n\n`;

    // Get all tables
    const [tables] = await connection.query('SHOW TABLES');
    const tableNames = tables.map(row => Object.values(row)[0]);

    console.log(`Found ${tableNames.length} tables...`);

    for (const tableName of tableNames) {
      console.log(`Exporting table: ${tableName}`);

      // Get CREATE TABLE statement
      const [createTable] = await connection.query(`SHOW CREATE TABLE \`${tableName}\``);
      sqlDump += `-- Table: ${tableName}\n`;
      sqlDump += `DROP TABLE IF EXISTS \`${tableName}\`;\n`;
      sqlDump += createTable[0]['Create Table'] + ';\n\n';

      // Get table data
      const [rows] = await connection.query(`SELECT * FROM \`${tableName}\``);
      
      if (rows.length > 0) {
        sqlDump += `-- Data for table: ${tableName}\n`;
        
        // Get column names
        const columns = Object.keys(rows[0]);
        const columnNames = columns.map(col => `\`${col}\``).join(', ');
        
        // Insert data in batches
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          const values = columns.map(col => {
            const value = row[col];
            if (value === null) return 'NULL';
            if (typeof value === 'number') return value;
            if (value instanceof Date) return `'${value.toISOString().slice(0, 19).replace('T', ' ')}'`;
            return `'${String(value).replace(/'/g, "''")}'`;
          }).join(', ');
          
          if (i === 0) {
            sqlDump += `INSERT INTO \`${tableName}\` (${columnNames}) VALUES\n`;
          }
          
          sqlDump += `(${values})`;
          
          if (i < rows.length - 1) {
            sqlDump += ',\n';
          } else {
            sqlDump += ';\n';
          }
        }
        
        sqlDump += '\n';
      }
    }

    // Write to file
    const filename = `sprint_db_export_${Date.now()}.sql`;
    fs.writeFileSync(filename, sqlDump);
    
    console.log(`\n✅ Database exported successfully to: ${filename}`);
    console.log(`File size: ${(fs.statSync(filename).size / 1024).toFixed(2)} KB`);

    await connection.end();
  } catch (error) {
    console.error('❌ Export failed:', error.message);
    process.exit(1);
  }
}

exportDatabase();
