import { routeRequest } from "./smart_router.js";

/**
 * Paraphrases text to match a specific tone.
 * * @param {string} text - The original sentence.
 * @param {string} targetTone - The desired style (e.g., "Professional", "Witty").
 * @returns {Promise<string>} - The paraphrased text.
 */
export async function paraphrase(text, targetTone = "Professional") {
    // Construct the prompt using your specified template
    const prompt = `
You are an expert communication coach.
Please paraphrase the following sentence to match the tone: "${targetTone}".

Original Sentence: "${text}"

Output ONLY the paraphrased version, with no introductory text.
`;

    // Delegate execution to the Smart Router
    return await routeRequest(prompt);
}

// const ans=await paraphrase('hey boss, i aint coming in today coz im totally sick','professional');
// console.log(ans);