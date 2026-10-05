const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  
  // Replace name
  content = content.replace(/Mise en Place/g, 'Smart Serve Catering');
  
  // Replace Logo M with S in the specific logo divs
  content = content.replace(
    /text-white font-display font-bold text-(xs|sm|base|lg|xl)">M<\/div>/g, 
    'text-white font-display font-bold text-$1">S</div>'
  );
  
  // Another variant in AdminLayout:
  content = content.replace(
    /rounded-[^>]+ flex items-center justify-center text-white font-display font-bold[^>]+>M<\/div>/g,
    match => match.replace('>M</div>', '>S</div>')
  );

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated', filePath);
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      replaceInFile(fullPath);
    }
  }
}

walk(path.join(__dirname, 'src'));
console.log('Done');
