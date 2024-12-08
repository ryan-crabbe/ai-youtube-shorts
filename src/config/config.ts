import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is required');
}

if (!process.env.ELEVENLABS_API_KEY) {
  throw new Error('ELEVENLABS_API_KEY is required');
}

export const config = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4',
    imageModel: 'dall-e-3',
    imageSize: '1024x1024',
    imageQuality: 'standard',
  },
  elevenLabs: {
    apiKey: process.env.ELEVENLABS_API_KEY,
    voiceId: process.env.ELEVENLABS_VOICE_ID || 'default',
    modelId: 'eleven_multilingual_v2',
  },
  video: {
    outputDir: path.join(process.cwd(), 'output'),
    tempDir: path.join(process.cwd(), 'temp'),
    defaultWidth: 1024,
    defaultHeight: 1024,
    fps: 30,
  }
};
