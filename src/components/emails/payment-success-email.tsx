import {
    Body,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Preview,
    Section,
    Text,
    Tailwind,
  } from "@react-email/components";
  import * as React from "react";
  
  interface PaymentSuccessEmailProps {
    userName: string;
    planName: string;
    amount: string;
    date: string;
  }
  
  export const PaymentSuccessEmail = ({
    userName = "Createur",
    planName = "Growth",
    amount = "5.000 FCFA",
    date = new Date().toLocaleDateString(),
  }: PaymentSuccessEmailProps) => (
    <Html>
      <Head />
      <Preview>Confirmation de paiement - MINDOS</Preview>
      <Tailwind>
        <Body style={main}>
          <Container style={container}>
            <Section style={header}>
              <Text style={logo}>MINDOS</Text>
            </Section>
            <Heading style={h1}>Paiement Confirmé.</Heading>
            <Text style={text}>
              Merci {userName}, votre abonnement au plan <strong>{planName}</strong> est maintenant actif.
              Votre reçu est joint à votre compte.
            </Text>
            
            <Section style={detailsContainer}>
                <div style={detailRow}>
                    <Text style={detailLabel}>PLAN</Text>
                    <Text style={detailValue}>{planName}</Text>
                </div>
                <div style={detailRow}>
                    <Text style={detailLabel}>MONTANT</Text>
                    <Text style={detailValue}>{amount}</Text>
                </div>
                <div style={detailRow}>
                    <Text style={detailLabel}>DATE</Text>
                    <Text style={detailValue}>{date}</Text>
                </div>
                <div style={detailRow}>
                    <Text style={detailLabel}>STATUT</Text>
                    <Text style={{...detailValue, color: "#22c55e"}}>SUCCÈS</Text>
                </div>
            </Section>

            <Text style={text}>
              Votre compte a été mis à jour automatiquement. Vous pouvez maintenant profiter de toutes les fonctionnalités avancées de votre nouveau plan.
            </Text>

            <Hr style={hr} />
            <Text style={footer}>
                MINDOS | The Creator OS - Musatec Enterprise
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
  
  export default PaymentSuccessEmail;
  
  const main = {
    backgroundColor: "#050505",
    fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen-Sans,Ubuntu,Cantarell,'Helvetica Neue',sans-serif",
  };
  
  const container = {
    margin: "0 auto",
    padding: "40px 20px",
    width: "465px",
    backgroundColor: "#0A0A0B",
    border: "1px solid #1a1a1b",
    borderRadius: "16px",
  };
  
  const header = {
    textAlign: "center" as const,
    marginBottom: "32px",
  };
  
  const logo = {
    fontSize: "24px",
    fontWeight: "900",
    color: "#ea580c",
    letterSpacing: "4px",
    margin: "0",
  };
  
  const h1 = {
    color: "#ffffff",
    fontSize: "24px",
    fontWeight: "800",
    textAlign: "center" as const,
    margin: "30px 0",
    textTransform: "uppercase" as const,
    letterSpacing: "-1px",
  };
  
  const text = {
    color: "#a1a1aa",
    fontSize: "14px",
    lineHeight: "24px",
    textAlign: "center" as const,
  };

  const detailsContainer = {
    padding: "24px",
    backgroundColor: "#050505",
    borderRadius: "12px",
    border: "1px solid #1a1a1b",
    margin: "24px 0",
  };

  const detailRow = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
  };

  const detailLabel = {
    color: "#71717a",
    fontSize: "10px",
    fontWeight: "900",
    letterSpacing: "1px",
    margin: "0",
  };

  const detailValue = {
    color: "#ffffff",
    fontSize: "12px",
    fontWeight: "700",
    margin: "0",
  };
  
  const hr = {
    borderColor: "#1a1a1b",
    margin: "40px 0",
  };
  
  const footer = {
    color: "#3f3f46",
    fontSize: "10px",
    textAlign: "center" as const,
    textTransform: "uppercase" as const,
    letterSpacing: "1px",
    margin: "4px 0",
  };
