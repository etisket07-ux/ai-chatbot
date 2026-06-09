/**
 * PDF → Markdown 변환 스크립트 (LlamaParse CLI 사용)
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
import { readdirSync, statSync } from 'fs';
import { execSync } from 'child_process';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

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

function convertPdf(pdfPath: string): void {
  const mdPath = pdfPath.replace(/\.pdf$/i, '.md');
  console.log(`\n📄 변환 중: ${basename(pdfPath)}`);

  execSync(
    `uvx --with llama-cloud llama-parse "${pdfPath}" --result-type markdown --output-file "${mdPath}"`,
    {
      env: { ...process.env, LLAMA_CLOUD_API_KEY: API_KEY! },
      stdio: 'inherit',
    }
  );

  console.log(`✅ 저장 완료: ${basename(mdPath)}`);
}

function main() {
  const args = process.argv.slice(2);

  const targets = args.length > 0
    ? args.map((a) => {
        const inManuals = resolve(MANUALS_DIR, a);
        const inCwd = resolve(process.cwd(), a);
        if (statSync(inCwd).isFile()) return inCwd;
        return inManuals;
      })
    : collectPdfs(MANUALS_DIR);

  const pdfs = targets.filter((f) => f.toLowerCase().endsWith('.pdf'));

  if (pdfs.length === 0) {
    console.log('변환할 PDF 파일이 없습니다.');
    return;
  }

  console.log(`\n🔍 ${pdfs.length}개 PDF 변환 시작...`);

  let success = 0;
  let fail = 0;

  for (const pdf of pdfs) {
    try {
      convertPdf(pdf);
      success++;
    } catch (err) {
      console.error(`❌ 실패: ${basename(pdf)} - ${err}`);
      fail++;
    }
  }

  console.log(`\n완료: 성공 ${success}개 / 실패 ${fail}개`);
  if (success > 0) {
    console.log('변환된 .md 파일 확인 후 npm run seed 로 DB에 업로드하세요.');
  }
}

main();
