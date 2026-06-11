const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/**/*.tsx');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // If there's an img tag
  if (content.includes('<img')) {
    // Make sure Image is imported
    if (!content.includes("import Image from 'next/image'")) {
      content = content.replace(/(import.*?;?\n)/, "$1import Image from 'next/image';\n");
    }

    // Replace <img ... className="...w-full h-full..." /> with <Image fill ... />
    // This is a naive replacement but usually works for standard formats
    content = content.replace(/<img([^>]*)className="([^"]*w-full h-full[^"]*)"([^>]*)>/g, '<Image$1fill className="$2"$3>');
    content = content.replace(/<img([^>]*)className='([^']*w-full h-full[^']*)'([^>]*)>/g, "<Image$1fill className='$2'$3>");
    
    // Replace remaining <img with <Image (assuming they have width/height or we add fill if they have w- and h- classes)
    content = content.replace(/<img([^>]*)className="([^"]*)"([^>]*)>/g, (match, p1, p2, p3) => {
      // If we already added fill, skip
      if (p1.includes('fill') || p3.includes('fill')) return `<Image${p1}className="${p2}"${p3}>`;
      
      // If it doesn't have width or height attributes, and has no fill, we might need to add width/height.
      // But let's just use fill and add relative to parent, or just add unoptimized for now?
      // Actually, let's just add fill for anything that had w-full
      if (p2.includes('w-') && p2.includes('h-')) {
          return `<Image fill${p1}className="${p2}"${p3}>`;
      }
      return `<Image${p1}className="${p2}"${p3}>`;
    });

    content = content.replace(/<img/g, '<Image');

    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});
