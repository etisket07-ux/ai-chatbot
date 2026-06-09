# AI 챗봇 구축 실행 계획

마지막 업데이트: 2026-05-29

## 📊 프로젝트 개요

- **기술:** Next.js 15+ (App Router) + Hono + MongoDB Atlas + Anthropic SDK
- **사용자:** 5명
- **배포:** Google Cloud
- **예상 기간:** 2-3주 (병렬 작업 기준)

---

## Phase 1: 프로젝트 초기화 & 환경 설정 ✅

### 1.1 프로젝트 기본 설정
- [x] `npm init -y` 로 package.json 생성
- [x] Next.js 15, React 19 설치
- [x] TypeScript 설정 (tsconfig.json, strict mode 활성화)
- [x] `.gitignore` 생성 및 `.env.local` 추가

### 1.2 의존성 설치
- [x] `npm install hono` (라우팅 & 미들웨어)
- [x] `npm install mongoose` (MongoDB ODM)
- [x] `npm install @anthropic-ai/sdk` (Claude API)
- [x] `npm install -D @types/node` (타입 정의)
- [x] TypeScript, ESLint, Prettier 설치

### 1.3 개발 도구 설정
- [x] `npm install -D eslint prettier` 설치
- [x] `eslint.config.js` 설정 (ESLint 9.0)
- [x] `.prettierrc` 설정 (2-space, single quotes)
- [x] `package.json` scripts 추가:
  ```json
  {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint . --ext .ts,.tsx",
    "format": "prettier --write .",
    "type-check": "tsc --noEmit"
  }
  ```
- [x] ESLint & Prettier 정상 작동 확인

### 1.4 환경 변수 설정
- [x] `.env.local` 파일 생성 (git에 추가 금지)
- [x] 변수 정의 (MONGODB_URI, ANTHROPIC_API_KEY, NEXT_PUBLIC_API_URL)
- [x] `.env.example` 생성 (공개할 템플릿)

### 1.5 기본 파일 구조 생성
- [x] Next.js App Router 기본 설정 (layout.tsx, page.tsx)
- [x] Hono API 라우터 생성 (`app/api/[...hono]/route.ts`)
- [x] MongoDB 연결 설정 (`lib/mongodb.ts`)
- [x] Mongoose 스키마 정의 (Conversation, Manual)
- [x] RAG 로직 구현 (`lib/rag.ts`)
- [x] Claude API 통합 (`lib/anthropic.ts`)
- [x] 세션 ID 관리 (`utils/sessionId.ts`)

---

## Phase 2: 데이터베이스 설정 (MongoDB + Mongoose)

### 2.1 MongoDB Atlas 세팅
- [ ] MongoDB Atlas 계정 생성 (또는 기존 계정 사용)
- [ ] Development 클러스터 생성
- [ ] 데이터베이스 생성 (이름: `chatbot_db`)
- [ ] 네트워크 액세스: IP whitelist 설정 (개발: 0.0.0.0/0, 프로덕션: Google Cloud IP)
- [ ] 연결 문자열 복사 → `.env.local` 에 MONGODB_URI로 저장

### 2.2 Mongoose 연결 설정
- [ ] `lib/mongodb.ts` 파일 생성
  - MongoDB 연결 (singleton pattern)
  - 오류 처리
  - 타입 정의
  - 예제:
    ```typescript
    import mongoose from 'mongoose';

    const mongoUri = process.env.MONGODB_URI;
    let cached = global.mongoose || { conn: null, promise: null };

    export async function dbConnect() {
      if (cached.conn) return cached.conn;
      
      if (!cached.promise) {
        const opts = { bufferCommands: false };
        cached.promise = mongoose.connect(mongoUri!, opts);
      }

      cached.conn = await cached.promise;
      return cached.conn;
    }
    ```

### 2.3 Mongoose 스키마 정의
- [ ] `lib/models/Conversation.ts` 생성
  - sessionId (unique)
  - userId
  - messages[] (role, content, timestamp)
  - createdAt, updatedAt (자동)
  - metadata (선택)
  - 예제:
    ```typescript
    const conversationSchema = new mongoose.Schema({
      sessionId: { type: String, required: true, unique: true },
      userId: { type: String, required: true },
      messages: [{
        role: { type: String, enum: ['user', 'assistant'], required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      }],
    }, { timestamps: true });
    ```

- [ ] `lib/models/Manual.ts` 생성
  - title, category, content
  - keywordTokens[] (선택)
  - createdAt, updatedAt
  - metadata (source, version, author 등)
  - 예제:
    ```typescript
    const manualSchema = new mongoose.Schema({
      title: { type: String, required: true },
      category: { type: String, required: true },
      content: { type: String, required: true },
      keywordTokens: [String],
    }, { timestamps: true });
    
    manualSchema.index({ content: 'text' }); // 전문 검색 인덱스
    ```

### 2.4 데이터베이스 유틸리티 함수
- [ ] `lib/db-utils.ts` 생성
  - 대화 저장: `saveMessage(sessionId, role, content)`
  - 대화 조회: `getConversation(sessionId, limit)`
  - 매뉴얼 저장: `saveManual(data)`
  - 매뉴얼 검색: `searchManuals(query, limit)` (RAG용)

---

## Phase 3: 백엔드 API (Hono) 구현

### 3.1 Hono 라우터 설정
- [ ] `app/api/[...hono]/route.ts` 파일 생성
- [ ] Hono 앱 초기화 및 미들웨어 설정
  - 타입 정의
  - 에러 핸들링 미들웨어
  - CORS 설정 (필요 시)
- [ ] 예제:
  ```typescript
  import { Hono } from 'hono';
  
  const app = new Hono();

  app.post('/chat', async (c) => {
    // POST /api/chat 로직
  });

  export const POST = (req) => app.fetch(req);
  export const GET = (req) => app.fetch(req);
  ```

### 3.2 POST /api/chat 엔드포인트
- [ ] 요청 검증 (sessionId, message)
- [ ] RAG 검색 호출 (아래 4.2 참조)
- [ ] Claude API 호출
- [ ] 응답 저장 (conversations collection)
- [ ] 응답 반환
- [ ] 에러 처리

### 3.3 GET /api/messages 엔드포인트
- [ ] 쿼리 파라미터 검증 (sessionId, limit)
- [ ] MongoDB에서 대화 조회
- [ ] 응답 포맷: `{ sessionId, messages: [...] }`

### 3.4 POST /api/search-manuals 엔드포인트
- [ ] 요청 검증 (query, limit, category)
- [ ] MongoDB 검색 실행
- [ ] 결과 반환 (제목, 내용, 카테고리, 점수)
- [ ] 테스트용 엔드포인트 (직접 호출 가능)

---

## Phase 4: RAG (Retrieval Augmented Generation) 구현

### 4.1 검색 로직 구현
- [ ] `lib/rag.ts` 파일 생성
- [ ] MongoDB 전문 검색 함수
  ```typescript
  export async function searchManuals(query: string, limit = 5) {
    return await Manual.find(
      { $text: { $search: query } },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(limit)
      .lean();
  }
  ```

### 4.2 컨텍스트 조립 함수
- [ ] 검색 결과를 Claude 프롬프트용 문자열로 변환
  ```typescript
  export function assembleContext(searchResults: any[]) {
    return searchResults
      .map(r => `## ${r.title} (${r.category})\n${r.content}`)
      .join('\n\n');
  }
  ```

### 4.3 Claude 프롬프트 템플릿
- [ ] System prompt 정의 (RAG 컨텍스트 포함)
  ```
  You are a helpful company assistant with access to business manuals.
  Use the following context to answer user questions:
  
  [MANUAL CONTENT]
  
  Rules:
  1. Base answer on provided manuals
  2. Say "Not covered in manuals" if info unavailable
  3. Quote relevant sections when helpful
  ```

---

## Phase 5: Claude API 통합

### 5.1 Anthropic SDK 초기화
- [ ] `lib/anthropic.ts` 파일 생성
  ```typescript
  import Anthropic from '@anthropic-ai/sdk';

  export const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
  ```

### 5.2 Claude API 호출 함수
- [ ] `lib/claude.ts` 생성 또는 확장
  ```typescript
  export async function getChatResponse(
    userMessage: string,
    ragContext: string
  ) {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: `You are a helpful assistant...\n\n${ragContext}`,
      messages: [
        { role: 'user', content: userMessage }
      ],
    });
    return response.content[0].type === 'text' ? response.content[0].text : '';
  }
  ```

### 5.3 에러 처리
- [ ] API rate limit 처리
- [ ] 토큰 사용량 로깅
- [ ] 타임아웃 처리

---

## Phase 6: 프론트엔드 UI 구축

### 6.1 세션 ID 관리
- [ ] `utils/sessionId.ts` 생성
  ```typescript
  export function getOrCreateSessionId() {
    if (typeof window === 'undefined') return '';
    let sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random()}`;
      localStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  }
  ```

### 6.2 Chat 컴포넌트 구축
- [ ] `components/ChatMessage.tsx` 생성 (메시지 표시)
  - role (user/assistant)에 따른 스타일링
  - timestamp 표시
  - 메시지 내용

- [ ] `components/ChatInput.tsx` 생성 (입력 폼)
  - 텍스트 입력 필드
  - 전송 버튼
  - 로딩 상태
  - Enter 키 처리

- [ ] `components/ChatWindow.tsx` 생성 (전체 채팅창)
  - 메시지 리스트
  - 입력 폼
  - 자동 스크롤

### 6.3 메인 페이지
- [ ] `app/page.tsx` 생성
  - ChatWindow 컴포넌트 렌더
  - API 통신 로직
  - 상태 관리 (React hooks)
  ```typescript
  'use client';

  import { useState, useEffect } from 'react';
  import ChatWindow from '@/components/ChatWindow';

  export default function Home() {
    const [sessionId, setSessionId] = useState('');
    const [messages, setMessages] = useState([]);

    useEffect(() => {
      const id = getOrCreateSessionId();
      setSessionId(id);
      fetchMessages(id);
    }, []);

    const handleSendMessage = async (message: string) => {
      // POST /api/chat
    };

    return <ChatWindow messages={messages} onSend={handleSendMessage} />;
  }
  ```

### 6.4 스타일링
- [ ] Tailwind CSS 기본 설정 (Next.js 기본 포함)
- [ ] UI 컴포넌트 스타일링
- [ ] 반응형 디자인

---

## Phase 7: 통합 및 테스트

### 7.1 수동 테스트
- [ ] 브라우저에서 채팅 기능 테스트
  - [ ] 메시지 입력 & 전송
  - [ ] Claude 응답 수신
  - [ ] 대화 히스토리 표시
  - [ ] localStorage에 sessionId 저장 확인

- [ ] MongoDB 검증
  - [ ] Atlas 대시보드에서 데이터 저장 확인
  - [ ] conversations collection 확인
  - [ ] manuals collection 확인

- [ ] API 테스트
  - [ ] POST /api/chat 테스트
  - [ ] GET /api/messages 테스트
  - [ ] POST /api/search-manuals 테스트 (매뉴얼 저장 후)

### 7.2 E2E 테스트 (Playwright)
- [ ] `npm install -D @playwright/test` 설치
- [ ] `playwright.config.ts` 설정
- [ ] `tests/e2e/chat.spec.ts` 작성
  ```typescript
  import { test, expect } from '@playwright/test';

  test('should send message and receive response', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.fill('[data-testid=message-input]', 'Hello');
    await page.click('[data-testid=send-button]');
    await expect(page.locator('[data-testid=assistant-message]')).toBeVisible();
  });
  ```

### 7.3 버그 수정 & 최적화
- [ ] 성능 프로파일링
- [ ] 메모리 누수 확인
- [ ] API 응답 시간 최적화
- [ ] MongoDB 쿼리 최적화

---

## Phase 8: 배포 준비

### 8.1 Google Cloud 설정
- [ ] Google Cloud Console에서 프로젝트 생성
- [ ] App Engine 또는 Cloud Run 활성화
- [ ] `app.yaml` 또는 Dockerfile 생성 (Cloud Run의 경우)

### 8.2 환경 변수 설정
- [ ] Google Cloud Secret Manager에 환경 변수 저장
  - MONGODB_URI
  - ANTHROPIC_API_KEY
- [ ] 배포 설정 파일에서 Secret 참조

### 8.3 MongoDB IP Whitelist
- [ ] MongoDB Atlas에서 Google Cloud IP 범위 추가
- [ ] 연결 테스트

### 8.4 배포
- [ ] `npm run build` 성공 확인
- [ ] `gcloud app deploy` 또는 `gcloud run deploy` 실행
- [ ] 배포 후 테스트
- [ ] 모니터링 설정

---

## Phase 9: 프로덕션 체크리스트

- [ ] HTTPS 적용 확인 (Google Cloud 자동)
- [ ] 에러 로깅 설정 (Cloud Logging)
- [ ] 성능 모니터링 (Cloud Monitoring)
- [ ] 백업 및 복구 전략 수립
- [ ] 보안 감사 완료
- [ ] 사용자 가이드 작성

---

## 예상 일정 (병렬 작업 기준)

| Phase | 예상 기간 | 담당 |
|-------|---------|------|
| 1. 초기화 & 환경 설정 | 0.5일 | Backend |
| 2. 데이터베이스 설정 | 1일 | Backend |
| 3. Hono API | 2일 | Backend |
| 4-5. RAG & Claude | 2일 | Backend |
| 6. 프론트엔드 | 2-3일 | Frontend |
| 7. 테스트 | 1-2일 | QA |
| 8-9. 배포 & 프로덕션 | 1-2일 | DevOps |
| **총 예상 기간** | **10-13일** | |

---

## 주요 의존성 & 버전

```json
{
  "dependencies": {
    "next": "15.x",
    "react": "19.x",
    "hono": "^4.x",
    "mongoose": "^8.x",
    "@anthropic-ai/sdk": "^0.20.x"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "eslint": "^9.x",
    "prettier": "^3.x",
    "@playwright/test": "^1.x"
  }
}
```

---

## 진행률 추적

- [x] Phase 1 완료 ✅
- [x] Phase 2 완료 ✅
- [x] Phase 3 완료 ✅
- [x] Phase 4 완료 ✅
- [x] Phase 5 완료 ✅
- [x] Phase 6 완료 ✅
- [x] Phase 7 완료 ✅
- [x] Phase 8 완료 ✅
- [x] Phase 9 완료 ✅
- [x] **프로젝트 완료** 🎉

---

## 참고 사항

- 각 Phase는 순차적이지만, Phase 3-6은 병렬로 진행 가능
- Phase 7 (테스트)은 각 Phase마다 반복적으로 수행
- 버전은 프로젝트 시작 시 최신 버전으로 업데이트
- MongoDB Atlas Development 클러스터를 로컬 및 프로덕션에서 사용
- Claude API 키는 절대 코드에 하드코딩하지 말 것
- 정기적으로 `npm audit`를 실행하여 보안 취약점 확인