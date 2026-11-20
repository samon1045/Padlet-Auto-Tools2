const baseUrl = process.env.BASE_URL;
const cookiesPath = process.env.COOKIES_FILE || '/tmp/cookies.json';
const serverId = process.env.SERVER_ID;
const sectionName = process.env.SECTION_NAME;
const messageText = process.env.MESSAGE_TEXT;
const imagePath = process.env.IMAGE_PATH;

if (!baseUrl || !serverId || !sectionName || !messageText || !imagePath) {
  throw new Error('必要な環境変数が不足しています。');
}
