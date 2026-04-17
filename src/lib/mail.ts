import { resend } from "./resend";
import WelcomeEmail from "@/components/emails/welcome-email";
import PaymentSuccessEmail from "@/components/emails/payment-success-email";

const domain = process.env.NEXT_PUBLIC_APP_URL || "https://musages.com";

export const sendWelcomeEmail = async (email: string, name: string) => {
  await resend.emails.send({
    from: "MINDOS <noreply@musages.com>",
    to: email,
    subject: "Bienvenue dans l'écosystème MINDOS",
    react: WelcomeEmail({ userName: name }),
  });
};

export const sendPaymentSuccessEmail = async (
  email: string,
  name: string,
  planName: string,
  amount: string
) => {
  await resend.emails.send({
    from: "MINDOS <payments@musages.com>",
    to: email,
    subject: "Confirmation de paiement - MINDOS",
    react: PaymentSuccessEmail({
      userName: name,
      planName,
      amount,
      date: new Date().toLocaleDateString("fr-FR"),
    }),
  });
};
