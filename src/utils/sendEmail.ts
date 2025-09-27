import nodemailer from "nodemailer";

const {
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_USER,
  EMAIL_PASS,
  FROM_EMAIL,
} = process.env;

// createTransport factory to reuse transporter when possible
const createTransporter = () => {
  if (EMAIL_HOST && EMAIL_USER && EMAIL_PASS) {
    const port = EMAIL_PORT ? parseInt(EMAIL_PORT, 10) : 587;
    const secure = port === 465;
    return nodemailer.createTransport({
      host: EMAIL_HOST,
      port,
      secure,
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
     
    });
  }

  return null;
};

export const sendEmail = async (to: string, subject: string, text: string, html?: string) => {
  const transporter = createTransporter();

  if (!transporter) {
  
    console.log(`(EMAIL FALLBACK) To: ${to}\nSubject: ${subject}\n\n${text}`);
    if (html) console.log("(HTML)\n", html);
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: FROM_EMAIL || EMAIL_USER,
      to,
      subject,
      text,
      html,
    });

    
    console.log("Email sent:", info.messageId);
    
  } catch (err: any) {
    console.error("Error sending email:", err.message || err);
    throw new Error("Failed to send email");
  }
};
