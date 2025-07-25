import { initializeApp, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Firebase 환경 변수 로드
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
const projectId = process.env.FIREBASE_PROJECT_ID;

// 절대 경로로 변환
const absolutePath = path.resolve(__dirname, '..', serviceAccountPath);

// SDK 초기화
const app = initializeApp({
    credential: cert(absolutePath),
    projectId: projectId
});

// FCM 서비스 가져오기
const messaging = getMessaging(app);

// Export
export { app, messaging };