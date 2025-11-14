import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.error("Gemini API key saknas, kolla .env");
}

const genAI = new GoogleGenerativeAI(API_KEY);

function dataUrlToBlob(dataUrl: string): { mimeType: string, data: string } {
    const parts = dataUrl.split(',');
    const mimeType = parts[0].match(/:(.*?);/)?.[1] || 'application/octet-stream';
    const data = parts[1];
    return { mimeType, data };
}

export async function generateGoalImage(
    imageDataUrl: string, 
    age: number,
    gender: string,
    goalWeight: number,
    goalFatPercentage?: number,
    goalMuscle?: number,
    currentWeight?: number
): Promise<string> {

    const { mimeType, data: base64ImageData } = dataUrlToBlob(imageDataUrl);

    const model = 'gemini-2.5-flash-image';
    const genderEnglish = gender === 'kvinna' ? 'woman' : 'man';
    
    let prompt: string;
    
    const preamble = `You are an expert fitness visualization AI. Your task is to create a hyper-realistic and exceptionally impactful 'after' image from a user-provided 'before' image and their fitness goals. The transformation must be visually staggering and highly motivating.`;
    const criticalInstructions = `CRITICAL: The transformation must be extremely dramatic. The difference between 'before' and 'after' should be maximized to create a powerful 'wow' effect. Push the boundaries of a realistic transformation to amplify the visual impact by an additional 10-15%. The result should be hyper-realistic yet astonishing. It is essential to preserve the person's core facial features and identity. Keep the background, clothing style, and lighting consistent with the original image.`;


    if (goalFatPercentage && goalMuscle) {
        prompt = `${preamble}

The person in the original image, a ${age}-year-old ${genderEnglish}, has undergone a remarkable transformation to achieve a goal of ${goalFatPercentage.toFixed(1)}% body fat and ${goalMuscle} kg of muscle mass.

Your generated image MUST show an extremely dramatic and unmistakable change. Visualize a significant reduction in body fat and a clear increase in muscle definition across the entire body. The physique should look lean, athletic, and powerful, directly reflecting the target metrics. Make sure their face also reflects a lower body fat percentage (e.g., a more defined jawline).

${criticalInstructions}`;
    }
    else if (currentWeight && currentWeight > 0 && goalWeight > 0) {
        if (goalWeight < currentWeight) {
            const weightLoss = currentWeight - goalWeight;
            prompt = `${preamble}

The person in the original image, a ${age}-year-old ${genderEnglish} who currently weighs ${currentWeight} kg, has achieved an inspiring weight loss, reaching their goal weight of ${goalWeight} kg (a loss of ${weightLoss.toFixed(1)} kg).

Your generated image MUST show an extremely dramatic and unmistakable reduction in body size and fat. Visualize a significantly slimmer waist, more defined jawline, and toned limbs. The person should look visibly healthier, more energetic, and leaner. Make sure their face also reflects the significant weight loss.

${criticalInstructions}`;
        } else {
            const weightGain = goalWeight - currentWeight;
            prompt = `${preamble}

The person in the original image, a ${age}-year-old ${genderEnglish} who currently weighs ${currentWeight} kg, has achieved a powerful transformation, reaching their goal weight of ${goalWeight} kg (a gain of ${weightGain.toFixed(1)} kg, primarily muscle).

Your generated image MUST show an extremely dramatic and unmistakable increase in muscle mass and definition. Visualize visibly larger and more defined muscles in the arms, shoulders, chest, and legs. The person should look significantly stronger, more athletic, and powerful.

${criticalInstructions}`;
        }
    }
    else {
        prompt = `${preamble}

The person in the original image, a ${age}-year-old ${genderEnglish}, has achieved a significant body transformation, reaching their goal weight of ${goalWeight} kg.

Your generated image MUST show an extremely dramatic change to a healthier, fitter physique. This should include a clear reduction in body fat and an increase in visible muscle tone. The overall silhouette should be noticeably different and more athletic.

${criticalInstructions}`;
    }
    
    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: base64ImageData,
                            mimeType: mimeType,
                        },
                    },
                    {
                        text: prompt,
                    },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });
        
        const firstPart = response.candidates?.[0]?.content?.parts?.[0];
        if (firstPart && firstPart.inlineData) {
            const base64ImageBytes: string = firstPart.inlineData.data;
            const newMimeType = firstPart.inlineData.mimeType;
            return `data:${newMimeType};base64,${base64ImageBytes}`;
        } else {
            console.error("Full Gemini Response:", JSON.stringify(response, null, 2));
            throw new Error("No image data found in the AI response. The request might have been blocked.");
        }
    } catch (error) {
        console.error("Gemini API call failed:", error);
        throw new Error("AI image generation failed. Please check the console for details.");
    }
}