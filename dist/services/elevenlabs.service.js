"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElevenLabsService = void 0;
const axios_1 = __importDefault(require("axios"));
const config_1 = require("../config/config");
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const ffprobe_1 = __importDefault(require("@ffprobe-installer/ffprobe"));
fluent_ffmpeg_1.default.setFfprobePath(ffprobe_1.default.path);
class ElevenLabsService {
    constructor() {
        this.baseUrl = 'https://api.elevenlabs.io/v1';
        this.headers = {
            'Accept': 'audio/mpeg',
            'xi-api-key': config_1.config.elevenLabs.apiKey,
            'Content-Type': 'application/json',
        };
    }
    async generateSpeech(ssml, index) {
        const url = `${this.baseUrl}/text-to-speech/${config_1.config.elevenLabs.voiceId}`;
        try {
            const response = await axios_1.default.post(url, {
                text: ssml,
                model_id: config_1.config.elevenLabs.modelId,
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75,
                },
            }, {
                headers: this.headers,
                responseType: 'arraybuffer',
            });
            await promises_1.default.mkdir(config_1.config.video.tempDir, { recursive: true });
            const audioPath = path_1.default.join(config_1.config.video.tempDir, `audio-${index}.mp3`);
            await promises_1.default.writeFile(audioPath, response.data);
            return audioPath;
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                throw new Error(`ElevenLabs API error: ${error.response?.data || error.message}`);
            }
            throw error;
        }
    }
    async getAudioDuration(audioPath) {
        return new Promise((resolve, reject) => {
            fluent_ffmpeg_1.default.ffprobe(audioPath, (err, metadata) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(metadata.format.duration || 0);
            });
        });
    }
}
exports.ElevenLabsService = ElevenLabsService;
