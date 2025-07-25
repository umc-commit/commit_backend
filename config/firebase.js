import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

// SDK 초기화
const app = initializeApp({
    credential: applicationDefault(),
    projectId: 'commit-31321'
});

// FCM 서비스 가져오기
const messaging = getMessaging(app);

// Export
export { app, messaging };