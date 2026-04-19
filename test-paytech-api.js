
require('dotenv').config();

async function testPayTech() {
    const apiKey = process.env.PAYTECH_API_KEY;
    const apiSecret = process.env.PAYTECH_SECRET_KEY;

    console.log("Testing PayTech with Keys...");
    console.log("API_KEY:", apiKey ? "Present" : "Missing");
    console.log("API_SECRET:", apiSecret ? "Present" : "Missing");

    const data = {
        item_name: "Test Connection",
        item_price: 100,
        command_name: "Test diagnostic",
        ref_command: "test_" + Date.now(),
        env: "test",
        ipn_url: "https://example.com/ipn",
        success_url: "https://example.com/success",
        cancel_url: "https://example.com/cancel",
    };

    try {
        const response = await fetch("https://paytech.sn/api/payment/request-payment", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "API_KEY": apiKey,
                "API_SECRET": apiSecret,
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();
        console.log("PayTech Response:", JSON.stringify(result, null, 2));
        
        if (result.success === 1) {
            console.log("✅ API Keys are VALID!");
        } else {
            console.log("❌ API Keys REJECTED by PayTech.");
        }
    } catch (err) {
        console.error("❌ Network Error:", err.message);
    }
}

testPayTech();
