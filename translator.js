import { routeRequest } from "./smart_router.js";

/**
 * Translates text between two languages.
 * * @param {string} text - The sentence to translate.
 * @param {string} sourceLang - The input language (e.g., "English").
 * @param {string} targetLang - The output language (e.g., "Hindi").
 * @returns {Promise<string>} - The translated text.
 */
export async function translate(text, sourceLang, targetLang) {
    // Construct the prompt using your specified template
    const prompt = `
You are a professional translator.
Please translate the following sentence from ${sourceLang} to ${targetLang}.

Sentence: "${text}"

Output only the translation, with no extra text.
`;

    // Delegate execution to the Smart Router
    return await routeRequest(prompt);
}

// const ans=await translate('hello, how are you?','English','hindi');
// console.log(ans);