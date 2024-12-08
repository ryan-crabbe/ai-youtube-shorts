"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is required');
}
if (!process.env.ELEVENLABS_API_KEY) {
    throw new Error('ELEVENLABS_API_KEY is required');
}
exports.config = {
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
        outputDir: path_1.default.join(process.cwd(), 'output'),
        tempDir: path_1.default.join(process.cwd(), 'temp'),
        defaultWidth: 1024,
        defaultHeight: 1024,
        fps: 30,
    }
};
