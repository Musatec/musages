
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async ({
  to,
  subject,
  html,
}: {
  to: string | string[];
  subject: string;
  html: string;
}) => {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Musages <onboarding@resend.dev>',
      to,
      subject,
      html,
    });

    if (error) {
      console.error('[RESEND_ERROR]', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('[MAIL_ERROR]', error);
    return { success: false, error };
  }
};
