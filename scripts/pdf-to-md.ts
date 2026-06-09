/**
 * PDF → Markdown 변환 스크립트 (LlamaParse 사용)
 *
 * 사용법:
 *   npm run pdf-to-md                        # manuals/ 전체 PDF 변환
 *   npm run pdf-to-md -- 파일명.pdf          # 특정 파일만 변환
 *   npm run pdf-to-md -- 인사/채용절차.pdf   # 하위 폴더 포함
 *
 * 변환 결과: 같은 위치에 .md 파일로 저장
 *   manuals/인사/채용절차.pdf → manuals/인사/채용절차.md
 */
import * as dotenv from 'dotenv';
import { resolve, basename } from 'path';
import { readdirSync, statSync, writeFileSync } from 'fs';
import { createRequire } from 'module';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const require = createRequire(import.meta.url);
const { LlamaParseReader } = require('llamaindex');

const MANUALS_DIR = resolve(process.cwd(), 'manuals');
const API_KEY = process.env.LLAMA_CLOUD_API_KEY;

if (!API_KEY) {
  console.error('❌ LLAMA_CLOUD_API_KEY가 .env.local에 없습니다.');
  process.exit(1);
}

function collectPdfs(dir: string): string[] {
  const results: string[] = [];
  for (const item of readdirSync(dir)) {
    const fullPath = resolve(dir, item);
    if (statSync(fullPath).isDirectory()) {
      results.push(...collectPdfs(fullPath));
    } else if (item.toLowerCase().endsWith('.pdf')) {
      results.push(fullPath);
    }
  }
  return results;
}

async function convertPdf(pdfPath: string): Promise<void> {
  const mdPath = pdfPath.replace(/\.pdf$/i, '.md');
  const fileName = basename(pdfPath);

  console.log(`\n📄 변환 중: ${fileName}`);

  const reader = new LlamaParseReader({
    apiKey: API_KEY,
    resultType: 'markdown',
    language: 'ko',
  });

  const documents = await reader.loadData(pdfPath);
  const content = documents.map((doc: { text: string }) => doc.text).join('\n\n');

  writeFileSync(mdPath, content, 'utf-8');
  console.log(`✅ 저장 완료: ${basename(mdPath)} (${content.length.toLocaleString()} chars)`);
}

async function main() {
  const args = process.argv.slice(2);

  let targets: string[] = [];

  if (args.length > 0) {
    // 특정 파일 지정
    targets = args.map((a) => resolve(MANUALS_DIR, a));
  } else {
    // manuals/ 전체 PDF
    targets = collectPdfs(MANUALS_DIR);
  }

  const pdfs = targets.filter((f) => f.toLowerCase().endsWith('.pdf'));

  if (pdfs.length === 0) {
    console.log('변환할 PDF 파일이 없습니다.');
    return;
  }

  console.log(`\n🔍 ${pdfs.length}개 PDF 변환 시작...\n`);

  let success = 0;
  let fail = 0;

  for (const pdf of pdfs) {
    try {
      await convertPdf(pdf);
      success++;
    } catch (err) {
      console.error(`❌ 실패: ${basename(pdf)} - ${err}`);
      fail++;
    }
  }

  console.log(`\n완료: 성공 ${success}개 / 실패 ${fail}개`);
  if (success > 0) {
    console.log('\n변환된 .md 파일을 확인 후 npm run seed 로 DB에 업로드하세요.');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
