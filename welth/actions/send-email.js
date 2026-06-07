import { Resend } from "resend";
import EmailTemplate from "@/emails/template";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({ to, subject, react }) {
  try {
    const { data, error } = await resend.emails.send({
      from: "Welth <onboarding@resend.dev>",
      to,
      subject,
      react,
    });

    if (error) throw new Error(error.message);
    return data;
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
}