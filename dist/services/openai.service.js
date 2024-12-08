"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIService = void 0;
const openai_1 = __importDefault(require("openai"));
const config_1 = require("../config/config");
const api_schema_1 = require("../schemas/api.schema");
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
class OpenAIService {
    constructor() {
        this.openai = new openai_1.default({
            apiKey: config_1.config.openai.apiKey,
        });
    }
    async generateChunks(generationConfig) {
        const segmentDuration = Math.floor(generationConfig.duration / generationConfig.chunkCount);
        const prompt = `Generate exactly ${generationConfig.chunkCount} video segments for a ${generationConfig.duration} second video about: ${generationConfig.prompt}

Each segment should be EXACTLY ${segmentDuration} seconds when spoken naturally. This is crucial for timing.

Return your response as a JSON object with this structure:
{
  "segments": [
    {
      "description": "Detailed visual description for DALL-E image generation",
      "ssml": "Speech text with SSML <break> tags for natural pauses"
    }
  ]
}

Guidelines for each segment:
1. Keep spoken text to 15-20 words maximum to fit within ${segmentDuration} seconds
2. Use at most one short <break time="0.3s"/> tag per segment if needed
3. Make descriptions clear and focused for DALL-E
4. Each segment should represent one clear step or aspect

Example segment length:
"Slice fresh tomatoes, eggplant, and zucchini into thin, uniform rounds. <break time="0.3s"/> Arrange them in a circular pattern."

Make the segments progress logically to tell a step-by-step story about ${generationConfig.prompt}.`;
        const completion = await this.openai.chat.completions.create({
            model: "gpt-4-1106-preview",
            messages: [
                {
                    role: 'system',
                    content: 'You are a video script generator that creates concise, precise content optimized for short-form videos. Always respond with a JSON object containing an array of video segments. Keep the spoken text very brief to maintain exact timing requirements.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            response_format: { type: "json_object" }
        });
        const content = completion.choices[0]?.message?.content;
        if (!content) {
            throw new Error('Failed to generate video segments: No content in response');
        }
        try {
            const parsedContent = JSON.parse(content);
            const validatedContent = api_schema_1.VideoGeneration.parse(parsedContent);
            return validatedContent.segments;
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to parse OpenAI response: ${error.message}`);
            }
            throw error;
        }
    }
    async generateImage(description, index) {
        const response = await this.openai.images.generate({
            model: config_1.config.openai.imageModel,
            prompt: description,
            size: config_1.config.openai.imageSize,
            quality: config_1.config.openai.imageQuality,
            n: 1,
        });
        const imageUrl = response.data[0]?.url;
        if (!imageUrl)
            throw new Error('Failed to generate image');
        // Download and save the image
        const imageResponse = await fetch(imageUrl);
        const imageBuffer = await imageResponse.arrayBuffer();
        await promises_1.default.mkdir(config_1.config.video.tempDir, { recursive: true });
        const imagePath = path_1.default.join(config_1.config.video.tempDir, `image-${index}.png`);
        await promises_1.default.writeFile(imagePath, Buffer.from(imageBuffer));
        return imagePath;
    }
}
exports.OpenAIService = OpenAIService;
