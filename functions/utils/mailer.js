import { Resend } from "resend";

export async function sendMailer(body, env) {
  const resend = new Resend(env.RESEND_API_KEY);

  const name = String(body.name ?? "").trim();
  const address = String(body.address ?? "").trim();
  const email = String(body.email ?? "").trim();
  const detail = String(body.detail ?? "").trim();
  const subject = String(body.subject ?? "").trim();

  if (!name || !email || !detail) {
    throw new Error("メール送信に必要な入力が不足しています");
  }

  const mailContent = `
【お名前】: ${name}
【住所】: ${address || "（未入力）"}
【件名】: ${subject || "（未入力）"}
【メールアドレス】: ${email}
【お問い合わせ内容】:
${detail}`;

  await Promise.all([
    // 管理者通知
    resend.emails.send({
      from: "onboarding@resend.dev",
      to: "htakagi@lvn.co.jp",
      subject: `【Web通知】${name}様より`,
      text: `Webサイトより通知:\n${mailContent}`,
    }),
    // 顧客自動返信
    resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "【自動返信】受け付けました",
      text: `${name} 様\n\n以下の内容で承りました。\n${mailContent}`,
    }),
  ]);
}
