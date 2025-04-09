const fs = require('fs');
const path = require('path');

const distDir = 'dist';
const watchDir = path.join(distDir, 'strapi-plugin-static-deploy');
const adminSrcDir = path.join(watchDir, 'admin', 'src');
const serverSrcDir = path.join(watchDir, 'server', 'src');

const targetAdminDir = path.join(distDir, 'admin', 'src');
const targetServerDir = path.join(distDir, 'server', 'src');

// Exit early if dist does not exist
if (!fs.existsSync(distDir)) {
  console.warn(`Directory "${distDir}" does not exist. Exiting.`);
  process.exit(0);
}

try {
  if (fs.existsSync(adminSrcDir)) {
    fs.rmSync(targetAdminDir, { recursive: true, force: true }); // Remove if exists
    fs.renameSync(adminSrcDir, targetAdminDir);
    console.log(`Moved ${adminSrcDir} → ${targetAdminDir}`);
  } else {
    console.warn(`Admin src directory not found: ${adminSrcDir}`);
  }
} catch (error) {
  console.log(`Failed to move ${adminSrcDir} to ${targetAdminDir} due to error: `, error);
}

try {
  if (fs.existsSync(serverSrcDir)) {
    fs.rmSync(targetServerDir, { recursive: true, force: true }); // Remove if exists
    fs.renameSync(serverSrcDir, targetServerDir);
    console.log(`Moved ${serverSrcDir} → ${targetServerDir}`);
  } else {
    console.warn(`Server src directory not found: ${serverSrcDir}`);
  }
} catch (error) {
  console.log(`Failed to move ${serverSrcDir} to ${targetServerDir} due to error: `, error);
}

try {
    fs.rmSync(watchDir, { recursive: true, force: true });
    fs.rmSync(watchDir, { recursive: true, force: true });
    console.log(`Deleted ${watchDir}`);
} catch (error) {
    console.log(`Failed to delete ${watchDir} due to error: `, error);
}