import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * This script fixes sourcemap issues by adding empty sourcemap comments to files
 * that have sourcemap errors during the build process.
 */
async function fixSourcemaps() {
  console.log('🔧 Fixing sourcemap issues...');
  
  // List of components with known sourcemap issues
  const componentsWithIssues = [
    'app/components/ui/Typewriter.tsx',
    'app/components/ui/SequentialGooeyText.tsx',
    'app/components/ui/Badge.tsx',
    'app/components/ui/Collapsible.tsx',
    'app/components/ui/ScrollArea.tsx'
  ];
  
  for (const filePath of componentsWithIssues) {
    try {
      const fullPath = join(__dirname, '..', filePath);
      const content = await readFile(fullPath, 'utf8');
      
      // Check if the file already has a sourcemap comment
      if (!content.includes('//# sourceMappingURL=')) {
        // Add an empty sourcemap comment to the end of the file
        const updatedContent = content + '\n//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiJ9';
        await writeFile(fullPath, updatedContent);
        console.log(`✅ Fixed sourcemap for ${filePath}`);
      } else {
        console.log(`ℹ️ Sourcemap already exists for ${filePath}`);
      }
    } catch (error) {
      console.error(`❌ Error fixing sourcemap for ${filePath}:`, error.message);
    }
  }
  
  console.log('✨ Sourcemap fixing completed!');
}

fixSourcemaps().catch(error => {
  console.error('❌ Error in fixSourcemaps:', error);
  process.exit(1);
});
