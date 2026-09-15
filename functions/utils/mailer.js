import { Resend } from "resend";

export async function sendMailer(body, env) {
  const resend = new Resend(env.RESEND_API_KEY);

  const mailContent = `
【お名前】: ${body.name}
【住所】: ${body.address}
【メールアドレス】: ${body.email}
【お問い合わせ内容】:
${body.detail}`;

  await Promise.all([
    // 管理者通知
    resend.emails.send({
      from: "onboarding@resend.dev",
      to: "htakagi@lvn.co.jp",
      subject: `【Web通知】${body.name}様より`,
      text: `Webサイトより通知:\n${mailContent}`,
    }),
    // 顧客自動返信
    resend.emails.send({
      from: "onboarding@resend.dev",
      to: body.email,
      subject: "【自動返信】受け付けました",
      text: `${body.name} 様\n\n以下の内容で承りました。\n${mailContent}`,
    }),
  ]);
}
