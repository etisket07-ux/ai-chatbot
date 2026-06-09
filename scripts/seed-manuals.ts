/**
 * 테스트용 매뉴얼 데이터 MongoDB에 삽입
 * 실행: npx tsx scripts/seed-manuals.ts
 */
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

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

const sampleManuals = [
  {
    title: '휴가 신청 절차',
    category: '인사',
    content:
      '휴가 신청은 최소 3일 전에 팀장에게 보고하고 인사 시스템(HR Portal)에 등록해야 합니다. ' +
      '연차 휴가는 연간 15일이 기본 지급되며, 입사 1년 미만은 월 1일씩 적립됩니다. ' +
      '병가는 의사 진단서를 제출해야 하며 연간 최대 7일까지 유급 처리됩니다.',
    keywordTokens: ['휴가', '연차', '병가', '인사', '신청'],
  },
  {
    title: '경비 처리 기준',
    category: '재무',
    content:
      '업무상 발생한 경비는 영수증과 함께 30일 이내에 경비 정산 시스템에 제출해야 합니다. ' +
      '식비는 1인 기준 1만원 이내, 교통비는 실비 지급입니다. ' +
      '10만원 이상의 경비는 팀장 사전 승인이 필요합니다.',
    keywordTokens: ['경비', '영수증', '정산', '식비', '교통비'],
  },
  {
    title: '보안 정책',
    category: 'IT',
    content:
      '사내 PC에는 개인 소프트웨어 설치를 금지합니다. 업무용 외부 USB 사용 시 IT팀에 사전 신청이 필요합니다. ' +
      '비밀번호는 90일마다 변경해야 하며 최소 8자 이상, 영문+숫자+특수문자 조합을 사용해야 합니다. ' +
      '회사 정보를 외부 클라우드(개인 구글 드라이브 등)에 저장하는 것은 금지됩니다.',
    keywordTokens: ['보안', '비밀번호', 'USB', 'IT', '클라우드'],
  },
  {
    title: '재택근무 규정',
    category: '인사',
    content:
      '재택근무는 주 2회까지 신청 가능하며 팀장 승인 후 시행합니다. ' +
      '재택 근무 시 오전 9시부터 오후 6시까지 업무 연락이 가능해야 합니다. ' +
      '중요 회의가 있는 날은 원칙적으로 출근을 권장합니다.',
    keywordTokens: ['재택', '원격', '근무', '재택근무'],
  },
  {
    title: '온보딩 프로세스',
    category: '인사',
    content:
      '신규 입사자는 입사 첫 날 인사팀에서 오리엔테이션을 받습니다. ' +
      '첫 주는 부서 소개 및 업무 파악, 2주차부터 실무 배정이 이루어집니다. ' +
      '3개월 수습 기간 동안 월 1회 면담을 통해 적응 여부를 평가합니다.',
    keywordTokens: ['신입', '온보딩', '입사', '수습'],
  },
];

async function seed() {
  await mongoose.connect(MONGODB_URI!);
  console.log('MongoDB 연결 성공');

  await Manual.deleteMany({});
  console.log('기존 매뉴얼 삭제 완료');

  await Manual.insertMany(sampleManuals);
  console.log(`${sampleManuals.length}개 매뉴얼 삽입 완료`);

  await mongoose.disconnect();
  console.log('완료');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
