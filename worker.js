// 1. 増やしたいHTMLファイルをここに並べてインポートするだけ
import indexHtml from "./public/index.html";
import { handleSubmit } from "./functions/api/submit.js";

// 2. URLのパス名（キー）と、表示したいHTML（値）をペアにして登録する
const pageRoutes = {
  "/": indexHtml,
};

// 2. API（処理関数）のルートマップ（LaravelのRoute::post的な役割）
const apiRoutes = {
  "/api/submit": handleSubmit,
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // A. APIリクエストの処理 (POST)
    if (request.method === "POST" && apiRoutes[path]) {
      const controller = apiRoutes[path];
      return await controller({ request, env }); // コントローラー関数を実行
    }

    // B. HTMLページの処理 (GET)
    if (request.method === "GET" && pageRoutes[path]) {
      return new Response(pageRoutes[path], {
        headers: { "content-type": "text/html;charset=UTF-8" },
      });
    }

    // リストにないURLにアクセスされた場合は一律で404エラー画面を返す
    return new Response(
      "<h1>404 Not Found</h1><p>ページが見つかりません。</p>",
      {
        status: 404,
        headers: { "content-type": "text/html;charset=UTF-8" },
      },
    );
  },
};
