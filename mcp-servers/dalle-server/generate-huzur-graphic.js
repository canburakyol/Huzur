import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// OpenAI API anahtarı - MCP ayarlarından
const apiKey = process.env.OPENAI_API_KEY || "YOUR_API_KEY_HERE";

const openai = new OpenAI({
  apiKey: apiKey,
});

// Görsel prompt'u - Play Store feature graphic için
const prompt = `Create a professional Play Store feature graphic for an Islamic prayer and worship app called "HUZUR" (Peace). 

Dimensions: 1024x500 pixels, horizontal banner format.

Design requirements:
- Background: Smooth gradient from turquoise (#40E0D0) to deep navy blue (#1A237E)
- Add subtle golden Islamic geometric patterns (Arabic calligraphy style motifs, celi suls)
- Center: Elegant mosque dome and minaret silhouette with golden outline and subtle glow
- Rising light/nur beams emanating from the dome representing spirituality
- Color palette: Gold (#D4AF37), turquoise, deep navy, warm white (#FFF8E7)
- Text at top: "HUZUR" in bold golden letters with elegant calligraphy style
- Text at bottom: "İbadetleriniz Artık Tek Tık Uzağınızda" (Your worship is now just one click away) in warm white elegant font
- Elegant golden frame corners
- Professional, premium, eye-catching design
- High quality, clean, modern Islamic aesthetic
- Minimalist but luxurious feel
- No cluttered elements, clean composition suitable for app store
- The text should be in Turkish as specified, with beautiful Islamic-inspired typography`;

async function generateImage() {
  console.log("Generating feature graphic for Huzur app...");

  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      size: "1024x1024", // DALL-E 3 desteklenen boyutlar: 1024x1024, 1792x1024, 1024x1792
      quality: "hd",
      style: "vivid",
      n: 1,
    });

    const imageUrl = response.data[0].url;
    console.log("Image generated successfully!");
    console.log("URL:", imageUrl);
    console.log("Revised prompt:", response.data[0].revised_prompt);

    // URL'yi kaydet
    const outputPath = path.join(__dirname, "huzur-feature-graphic-url.txt");
    fs.writeFileSync(outputPath, `Image URL: ${imageUrl}\nRevised Prompt: ${response.data[0].revised_prompt}`);
    console.log("URL saved to:", outputPath);

  } catch (error) {
    console.error("Error generating image:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
    }
  }
}

generateImage();
