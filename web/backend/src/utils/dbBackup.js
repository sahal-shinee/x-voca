/**
 * TiDB Cloud & MySQL Database Backup Utility
 * Script pencadangan basis data otomatis & terstruktur untuk X-VOCA.
 */

const path = require('path');
const { execSync } = require('child_process');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const runBackup = () => {
  const host = process.env.DB_HOST || 'localhost';
  const port = process.env.DB_PORT || 3306;
  const user = process.env.DB_USER || 'root';
  const pass = process.env.DB_PASS || '';
  const database = process.env.DB_NAME || 'xvoca_db';

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const outputFile = path.join(__dirname, `../../backup_${database}_${timestamp}.sql`);

  console.log('====================================================');
  console.log('   X-VOCA DATABASE BACKUP UTILITY (TiDB / MySQL)    ');
  console.log('====================================================');
  console.log(`📡 Host       : ${host}`);
  console.log(`🔌 Port       : ${port}`);
  console.log(`👤 User       : ${user}`);
  console.log(`💾 Database   : ${database}`);
  console.log(`📁 Target File: ${outputFile}`);
  console.log('----------------------------------------------------');

  try {
    // Check if mysqldump is installed locally
    execSync('mysqldump --version', { stdio: 'pipe' });

    console.log('⏳ Menjalankan mysqldump dengan enkripsi SSL TiDB Cloud...');
    
    // TiDB Cloud requires SSL connection (--ssl-mode=REQUIRED or --ssl)
    const sslFlag = host.includes('tidbcloud.com') ? '--ssl-mode=REQUIRED' : '';
    const passFlag = pass ? `-p"${pass}"` : '';

    const cmd = `mysqldump -h ${host} -P ${port} -u ${user} ${passFlag} ${sslFlag} --single-transaction --quick --databases ${database} > "${outputFile}"`;

    execSync(cmd, { stdio: 'inherit' });

    console.log('✅ Pencadangan (Backup) basis data berhasil disimpan di:');
    console.log(`   ${outputFile}`);
  } catch (error) {
    if (error.message && error.message.includes('not recognized') || error.message.includes('not found')) {
      console.log('ℹ️  Utilitas CLI `mysqldump` lokal tidak ditemukan di sistem ini.');
      console.log('');
      console.log('💡 STRATEGI PENCADANGAN TIDB CLOUD:');
      console.log('1. Buka TiDB Cloud Console (https://tidbcloud.com)');
      console.log('2. Pilih Kluster Serverless Anda -> Buka tab "Backup & Restore"');
      console.log('3. TiDB Cloud secara otomatis membuat Snapshot berkala harian.');
      console.log('4. Untuk cadangan manual instan, klik tombol "Manual Backup" / "Snapshot".');
      console.log('');
      console.log('Lihat panduan lengkap di: docs/DATABASE_BACKUP_GUIDE.md');
    } else {
      console.error('❌ Gagal mencadangkan database:', error.message);
    }
  }
};

runBackup();
