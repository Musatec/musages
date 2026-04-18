
export interface PayTechRequest {
    item_name: string;
    item_price: number;
    command_name: string;
    ref_command: string;
    env: "test" | "prod";
    ipn_url: string;
    success_url: string;
    cancel_url: string;
    custom_field?: string;
}

export interface PayTechResponse {
    success: number;
    token?: string;
    redirect_url?: string;
    error?: string[];
}

export async function createPayTechPayment(data: PayTechRequest): Promise<PayTechResponse> {
    const apiKey = process.env.PAYTECH_API_KEY;
    const apiSecret = process.env.PAYTECH_SECRET_KEY;

    if (!apiKey || !apiSecret) {
        throw new Error("Missing PayTech API keys in environment variables.");
    }

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
        return result;
    } catch (error) {
        console.error("[PAYTECH_API_ERROR]", error);
        return { success: 0, error: ["Une erreur est survenue lors de la communication avec PayTech"] };
    }
}
