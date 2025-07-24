// app/api/send-order-mail/route.js
import nodemailer from 'nodemailer';

export async function POST(req) {
  try {
    const { to, subject, html } = await req.json();

    // SMTP ayarlarını burada yapıyoruz
    const transporter = nodemailer.createTransport({
      service: 'gmail',  // Gmail kullanıyorsanız
      auth: {
        user: process.env.SMTP_USER, // Gmail e-posta adresiniz
        pass: process.env.SMTP_PASS, // Gmail uygulama parolanız
      },
    });

    const mailOptions = {
      from: process.env.SMTP_USER, // Gönderen e-posta adresi
      to,                         // Alıcı e-posta adresi
      subject,                    // E-posta başlığı
      html,                       // HTML içerik
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('E-posta başarıyla gönderildi:', info.response);
    return new Response(
      JSON.stringify({ message: 'E-posta başarıyla gönderildi.' }),
      { status: 200 }
    );
  } catch (error) {
    console.error('E-posta gönderimi sırasında bir hata oluştu:', error);
    return new Response(
      JSON.stringify({ error: 'E-posta gönderilirken hata oluştu.' }),
      { status: 500 }
    );
  }
}
