import { test, expect } from '@playwright/test';

test.describe('Chat UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('페이지 로드 시 채팅 UI가 표시된다', async ({ page }) => {
    await expect(page.locator('[data-testid="message-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="send-button"]')).toBeVisible();
  });

  test('초기 상태에서 전송 버튼이 비활성화되어 있다', async ({ page }) => {
    await expect(page.locator('[data-testid="send-button"]')).toBeDisabled();
  });

  test('메시지 입력 시 전송 버튼이 활성화된다', async ({ page }) => {
    await page.fill('[data-testid="message-input"]', '안녕하세요');
    await expect(page.locator('[data-testid="send-button"]')).toBeEnabled();
  });

  test('메시지를 전송하면 사용자 메시지가 화면에 표시된다', async ({ page }) => {
    await page.fill('[data-testid="message-input"]', '테스트 메시지');
    await page.click('[data-testid="send-button"]');
    await expect(page.locator('[data-testid="user-message"]').first()).toBeVisible();
    await expect(page.locator('[data-testid="user-message"]').first()).toContainText('테스트 메시지');
  });

  test('메시지 전송 후 입력창이 비워진다', async ({ page }) => {
    await page.fill('[data-testid="message-input"]', '테스트');
    await page.click('[data-testid="send-button"]');
    await expect(page.locator('[data-testid="message-input"]')).toHaveValue('');
  });

  test('Enter 키로 메시지를 전송할 수 있다', async ({ page }) => {
    await page.fill('[data-testid="message-input"]', 'Enter 테스트');
    await page.press('[data-testid="message-input"]', 'Enter');
    await expect(page.locator('[data-testid="user-message"]').first()).toBeVisible();
  });

  test('Shift+Enter는 줄바꿈이 된다', async ({ page }) => {
    await page.fill('[data-testid="message-input"]', '첫번째 줄');
    await page.press('[data-testid="message-input"]', 'Shift+Enter');
    await page.type('[data-testid="message-input"]', '두번째 줄');
    const value = await page.inputValue('[data-testid="message-input"]');
    expect(value).toContain('\n');
  });

  test('메시지 전송 후 AI 응답이 표시된다', async ({ page }) => {
    await page.fill('[data-testid="message-input"]', '안녕하세요');
    await page.click('[data-testid="send-button"]');
    await expect(page.locator('[data-testid="assistant-message"]').first()).toBeVisible({
      timeout: 30_000,
    });
  });

  test('localStorage에 sessionId가 저장된다', async ({ page }) => {
    const sessionId = await page.evaluate(() => localStorage.getItem('sessionId'));
    expect(sessionId).toBeTruthy();
    expect(sessionId).toMatch(/^session_/);
  });

  test('페이지 새로고침 후 동일한 sessionId가 유지된다', async ({ page }) => {
    const sessionId = await page.evaluate(() => localStorage.getItem('sessionId'));
    await page.reload();
    const sessionIdAfterReload = await page.evaluate(() => localStorage.getItem('sessionId'));
    expect(sessionId).toBe(sessionIdAfterReload);
  });
});

test.describe('API 엔드포인트', () => {
  test('GET /api/health 가 200을 반환한다', async ({ request }) => {
    const res = await request.get('/api/health');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('ok');
  });

  test('POST /api/chat - sessionId 없으면 400 반환', async ({ request }) => {
    const res = await request.post('/api/chat', {
      data: { message: '테스트' },
    });
    expect(res.status()).toBe(400);
  });

  test('GET /api/messages - sessionId 없으면 400 반환', async ({ request }) => {
    const res = await request.get('/api/messages');
    expect(res.status()).toBe(400);
  });

  test('GET /api/messages - 빈 세션은 빈 배열 반환', async ({ request }) => {
    const res = await request.get('/api/messages?sessionId=test_nonexistent_session_12345');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.messages).toEqual([]);
  });
});
