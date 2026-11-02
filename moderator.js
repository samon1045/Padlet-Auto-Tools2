const { chromium } = require('playwright');
const fs = require('fs');

async function saveAuth() {
    // 画面を表示した状態でブラウザを起動（headless: false）
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    // Padletのログイン画面を開く
    await page.goto('https://padlet.com/login', { waitUntil: 'domcontentloaded' });

    console.log('==================================================');
    console.log('ブラウザが起動しました！');
    console.log('1. ブラウザ上でPadletに手動でログインしてください。');
    console.log('2. ログインが完了し、ボード一覧やダッシュボード画面が表示されたら、');
    console.log('   この黒い画面（ターミナル）に戻って何かキーを押してください。');
    console.log('==================================================');

    // ユーザーがログインしてキーを押すまで待機
    await new Promise(resolve => {
        process.stdin.once('data', async () => {
            // ログイン情報のクッキーを保存
            await context.storageState({ path: 'auth.json' });
            console.log('✅ ログイン情報を `auth.json` として保存しました！');
            await browser.close();
            process.exit(0);
        });
    });
}

saveAuth();
