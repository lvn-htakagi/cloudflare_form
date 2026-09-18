import { sendMailer } from "../utils/mailer.js";

// POST /api/submit の実際の処理
export async function handleSubmit(context) {
  try {
    // 1. JSONデータの取得
    const { request, env } = context;
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name : "";
    const token = body["cf-turnstile-response"];
    const ip = request.headers.get("CF-Connecting-IP");

    if (!token) {
      return Response.json(
        { success: false, message: "Turnstileトークンがありません" },
        { status: 400 },
      );
    }

    console.log("受信データ:", name);

    // 1. Cloudflare Turnstile の検証リクエスト作成
    const formData = new FormData();
    formData.append("secret", env.TURNSTILE_SECRET_KEY);
    formData.append("response", token);
    if (ip) formData.append("remoteip", ip);

    // 2. 公式検証 API へ送信
    const turnstileResult = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        body: formData,
        method: "POST",
      },
    );

    const outcome = await turnstileResult.json();

    // 3. 検証失敗時の処理
    if (!outcome.success) {
      return Response.json(
        {
          success: false,
          message: "Turnstile認証に失敗しました",
        },
        { status: 400 },
      );
    }

    const normalizedName = String(body.name ?? "").trim();
    const address = String(body.address ?? "").trim();
    const email = String(body.email ?? "").trim();
    const detail = String(body.detail ?? "").trim();

    if (!normalizedName || !email || !detail) {
      return Response.json(
        { success: false, message: "必要な入力項目が不足しています" },
        { status: 400 },
      );
    }

    // 内側の try: D1（データベース）に関するエラーだけを個別で扱う
    try {
      await env.DB.prepare(
        "INSERT INTO chokuei_inquiries (name, address, email, detail) VALUES (?, ?, ?, ?)",
      )
        .bind(normalizedName, address, email, detail)
        .run();
    } catch (dbError) {
      console.error("D1エラー:", dbError);
      // DB保存失敗時専用のエラーレスポンスを返して終了
      return Response.json(
        {
          success: false,
          message: "データベースの保存に失敗しました",
        },
        { status: 500 },
      );
    }

    try {
      await sendMailer(
        { ...body, name: normalizedName, address, email, detail },
        env,
      );
    } catch (emailError) {
      console.error(
        "sendMailer実行エラー:",
        emailError instanceof Error ? emailError.message : emailError,
      );
      return Response.json(
        {
          success: false,
          message: "メール送信に失敗しました",
        },
        { status: 500 },
      );
    }

    // なにもかもが成功レスポンスを返す
    return Response.json({
      success: true,
      message: "送信が完了しました！",
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "データ処理エラーが発生しました",
      },
      { status: 400 },
    );
  }
}

export async function onRequestPost(context) {
  // 任意名の関数を呼び出して結果をそのまま返す
  return await handleSubmit(context);
}
