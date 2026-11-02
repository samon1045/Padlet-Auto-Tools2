const { chromium } = require('playwright');
const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');

const TARGET_BOARD_URL = process.env.TARGET_URL;
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// AIによる高度な内容判定
async function analyzeWithGemini(text) {
    if (!text) return false;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                {
                    role: 'user',
                    parts: [
                        { text: `以下の掲示板の投稿が荒らしやルール違反、あるいは悪質な連投にあたるか判定してください。結果は「SAFE」または「VIOLATION」のどちらか一言で答えてください。\n\n投稿テキスト: "${text}"` }
                    ]
                }
            ]
        });
        const result = response.text();
        return result.includes('VIOLATION');
    } catch (err) {
        console.error('AI解析エラー:', err.message);
        return false;
    }
}

async function main() {
    if (!TARGET_BOARD_URL) {
        throw new Error('TARGET_URLが設定されていません。');
    }

    console.log('🛡️ モデレーション専用ボットを開始します...');
    
    const browser = await chromium.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    
    // auth.jsonがあれば読み込んでログイン状態を維持
    const context = await browser.newContext(
        fs.existsSync('auth.json') ? { storageState: 'auth.json' } : {}
    );
    const page = await context.newPage();

    try {
        console.log('Padletボードにアクセス中...');
        await page.goto(TARGET_BOARD_URL, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(4000);

        console.log('ボード上の投稿・コメントをスキャン中...');

        // 例：カード要素の取得（PadletのDOM構造に合わせてセレクタを調整）
        const cards = await page.$$('.card, [data-testid*="card"], article');
        console.log(`検出されたカード数: ${cards.length}件`);

        // ここで各カードのテキストや投稿者を抽出し、
        // 同一メッセージ＆画像が3個以上続いているか、あるいはAI判定に引っかかるかをチェックするロジックを記述します。
        // 条件に一致した場合は、共有・メンバー設定画面を開いて権限を「閲覧のみ (Viewer)」に変更する自動操作を組み込みます。

        console.log('✨ モデレーション巡回が完了しました。');

    } catch (error) {
        console.error('モデレーション処理中にエラーが発生しました:', error);
        process.exit(1);
    } finally {
        await browser.close();
    }
}

main();
