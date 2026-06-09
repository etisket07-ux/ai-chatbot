/**
 * manuals/ 폴더의 파일을 읽어 MongoDB에 업로드
 *
 * 폴더 구조:
 *   manuals/파일명.txt          → 카테고리: "일반"
 *   manuals/카테고리/파일명.txt  → 카테고리: 폴더명
 *
 * 지원 형식: .txt, .md, .pdf
 * 실행: npm run seed
 */
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { readdirSync, readFileSync, statSync } from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse') as (buffer: Buffer) => Promise<{ text: string }>;

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error('MONGODB_URI not set in .env.local');

const manualSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: { type: String, required: true },
    content: { type: String, required: true },
    keywordTokens: [String],
  },
  { timestamps: true }
);
manualSchema.index({ content: 'text', title: 'text', category: 'text' });
const Manual = mongoose.models.Manual || mongoose.model('Manual', manualSchema);

const MANUALS_DIR = resolve(process.cwd(), 'manuals');
const SUPPORTED = ['.txt', '.md', '.pdf'];

interface ManualEntry {
  title: string;
  category: string;
  content: string;
}

async function extractContent(filePath: string, ext: string): Promise<string> {
  if (ext === '.pdf') {
    const buffer = readFileSync(filePath);
    const data = await pdfParse(buffer);
    return data.text.trim();
  }
  return readFileSync(filePath, 'utf-8').trim();
}

async function collectFiles(): Promise<ManualEntry[]> {
  const entries: ManualEntry[] = [];

  for (const item of readdirSync(MANUALS_DIR)) {
    const itemPath = resolve(MANUALS_DIR, item);
    const stat = statSync(itemPath);

    if (stat.isDirectory()) {
      const category = item;
      for (const file of readdirSync(itemPath)) {
        const ext = file.slice(file.lastIndexOf('.')).toLowerCase();
        if (!SUPPORTED.includes(ext)) continue;
        const title = file.replace(/\.(txt|md|pdf)$/i, '');
        const content = await extractContent(resolve(itemPath, file), ext);
        if (content) entries.push({ title, category, content });
      }
    } else {
      const ext = item.slice(item.lastIndexOf('.')).toLowerCase();
      if (!SUPPORTED.includes(ext)) continue;
      const title = item.replace(/\.(txt|md|pdf)$/i, '');
      const content = await extractContent(itemPath, ext);
      if (content) entries.push({ title, category: '일반', content });
    }
  }

  return entries;
}

async function seed() {
  const files = await collectFiles();

  if (files.length === 0) {
    console.log('manuals/ 폴더에 .txt 또는 .md 파일이 없습니다.');
    return;
  }

  await mongoose.connect(MONGODB_URI!);
  console.log('MongoDB 연결 성공');

  await Manual.deleteMany({});
  console.log('기존 매뉴얼 삭제 완료');

  await Manual.insertMany(files);
  console.log(`\n✅ ${files.length}개 파일 업로드 완료:\n`);
  for (const f of files) {
    console.log(`  [${f.category}] ${f.title}`);
  }

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
