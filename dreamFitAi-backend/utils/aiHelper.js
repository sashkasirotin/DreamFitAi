const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * Executes an AI call with retry logic and detailed logging.
 * @param {string} modelName - The model name to use.
 * @param {any} contents - The contents to generate (string or array of parts).
 * @param {number} maxRetries - Maximum number of retries.
 */
async function callGeminiWithRetry(modelName, contents, maxRetries = 2) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is missing");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });

    let lastError;
    for (let i = 0; i <= maxRetries; i++) {
        try {
            console.log(`[AI-DEBUG] Attempt ${i + 1} for model ${modelName}`);
            
            const result = await model.generateContent(contents);
            const response = result.response;
            const text = response.text();

            // Log usage metadata if available
            if (response.usageMetadata) {
                console.log(`[AI-USAGE] Tokens: Prompt=${response.usageMetadata.promptTokenCount}, Response=${response.usageMetadata.candidatesTokenCount}, Total=${response.usageMetadata.totalTokenCount}`);
            }

            return {
                text,
                usage: response.usageMetadata || null
            };
        } catch (error) {
            lastError = error;
            console.error(`[AI-ERROR] Attempt ${i + 1} failed:`, error.message);
            
            // If it's a 429 (Rate Limit), wait longer before retrying
            if (error.status === 429 || error.message.includes("429")) {
                if (error.message.includes("quota") || error.message.includes("Quota")) {
                    console.error("[AI-ERROR] Daily quota exceeded for this API key.");
                    throw new Error("Daily AI quota exceeded. Please try again tomorrow or upgrade your Gemini API plan.");
                }
                const waitTime = Math.pow(2, i) * 1000;
                console.log(`[AI-DEBUG] Rate limit hit. Waiting ${waitTime}ms...`);
                await new Promise(res => setTimeout(res, waitTime));
            } else if (error.status === 404 || error.message.includes("404")) {
                // Don't retry on 404
                break;
            }
        }
    }

    throw lastError;
}

module.exports = { callGeminiWithRetry };
