import fs from 'fs';
import path from 'path';

// Load pastPapersData by evaluating or transpiling
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

async function inspectOfficialPdfs() {
  // Let's read pastPapersData.ts and examine CAMBRIDGE_SUBJECT_CONFIGS and EDEXCEL_SUBJECT_CONFIGS
  const filePath = path.resolve('src/data/pastPapersData.ts');
  const code = fs.readFileSync(filePath, 'utf8');

  // Extract CAMBRIDGE_SUBJECT_CONFIGS
  const cambridgeBlockMatch = code.match(/const CAMBRIDGE_SUBJECT_CONFIGS[\s\S]*?\];/);
  const edexcelBlockMatch = code.match(/const EDEXCEL_SUBJECT_CONFIGS[\s\S]*?\];/);

  console.log('Cambridge config found:', !!cambridgeBlockMatch);
  console.log('Edexcel config found:', !!edexcelBlockMatch);
}

inspectOfficialPdfs();
