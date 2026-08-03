const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
  console.log('Building frontend application...');
  execSync('npm run build', { cwd: path.join(__dirname, 'frontend'), stdio: 'inherit' });

  const srcDir = path.join(__dirname, 'frontend', 'dist');
  const destDir = path.join(__dirname, 'dist');

  console.log(`Copying build output from ${srcDir} to ${destDir}...`);
  if (fs.existsSync(destDir)) {
    fs.rmSync(destDir, { recursive: true, force: true });
  }
  fs.mkdirSync(destDir, { recursive: true });
  
  if (fs.cpSync) {
    fs.cpSync(srcDir, destDir, { recursive: true });
  } else {
    // Recursive copy fallback for older Node versions
    const copyDir = (src, dest) => {
      fs.mkdirSync(dest, { recursive: true });
      const entries = fs.readdirSync(src, { withFileTypes: true });
      for (let entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
          copyDir(srcPath, destPath);
        } else {
          fs.copyFileSync(srcPath, destPath);
        }
      }
    };
    copyDir(srcDir, destDir);
  }
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build process failed:', error);
  process.exit(1);
}
