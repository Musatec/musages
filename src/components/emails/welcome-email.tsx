import {
    Body,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Img,
    Link,
    Preview,
    Section,
    Text,
    Tailwind,
  } from "@react-email/components";
  import * as React from "react";
  
  interface WelcomeEmailProps {
    userName: string;
  }
  
  export const WelcomeEmail = ({
    userName = "Createur",
  }: WelcomeEmailProps) => (
    <Html>
      <Head />
      <Preview>Bienvenue dans l'écosystème MINDOS</Preview>
      <Tailwind>
        <Body style={main}>
          <Container style={container}>
            <Section style={header}>
              <Text style={logo}>MINDOS</Text>
            </Section>
            <Heading style={h1}>Bienvenue, {userName}.</Heading>
            <Text style={text}>
              Vous venez de franchir une étape cruciale. MINDOS n'est pas seulement un outil de gestion,
              c'est le centre de commandement de votre ambition.
            </Text>
            <Section style={buttonContainer}>
              <Link style={button} href="https://musages.com/dashboard">
                Accéder au Dashboard
              </Link>
            </Section>
            <Text style={text}>
              Prenez quelques minutes pour explorer vos nouveaux pouvoirs :
            </Text>
            <Section style={features}>
                <Text style={featureItem}>🛡️ <strong>Sécurité Alpha</strong> : Vos données sont isolées et chiffrées.</Text>
                <Text style={featureItem}>📊 <strong>Intelligence Réseau</strong> : Surveillez vos boutiques en temps réel.</Text>
                <Text style={featureItem}>💸 <strong>Trésorerie Maîtrisée</strong> : Ne perdez plus jamais la trace d'un paiement.</Text>
            </Section>
            <Hr style={hr} />
            <Text style={footer}>
                MINDOS | The Creator OS - Musatec Enterprise
            </Text>
            <Text style={footer}>
                Dakar, Sénégal.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
  
  export default WelcomeEmail;
  
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
  
  const buttonContainer = {
    textAlign: "center" as const,
    margin: "32px 0",
  };
  
  const button = {
    backgroundColor: "#ea580c",
    borderRadius: "8px",
    color: "#000000",
    fontSize: "12px",
    fontWeight: "900",
    textDecoration: "none",
    textAlign: "center" as const,
    display: "inline-block",
    padding: "12px 24px",
    textTransform: "uppercase" as const,
    letterSpacing: "1px",
  };
  
  const features = {
    padding: "20px",
    backgroundColor: "#050505",
    borderRadius: "12px",
    border: "1px solid #1a1a1b",
    margin: "24px 0",
  };
  
  const featureItem = {
    color: "#d1d1d6",
    fontSize: "12px",
    lineHeight: "20px",
    margin: "12px 0",
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
