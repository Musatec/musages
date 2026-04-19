
require('dotenv').config();

async function testEmail() {
  console.log("🚀 Tentative d'envoi d'un email via Fetch...");
  
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Musages Test <onboarding@resend.dev>',
        to: 'petitmessi2020@gmail.com',
        subject: 'Test Musages - Resend Fonctionnel (Fetch) !',
        html: '<h1>MINDOS / Musages</h1><p>Test réussi via fetch direct !</p>',
      }),
    });

    const data = await response.json();
    console.log('Result:', data);
  } catch (err) {
    console.error('❌ Erreur Fetch:', err.message);
  }
}

testEmail();
