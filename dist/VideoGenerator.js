"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoGenerator = void 0;
const path_1 = __importDefault(require("path"));
const openai_service_1 = require("./services/openai.service");
const elevenlabs_service_1 = require("./services/elevenlabs.service");
const video_service_1 = require("./services/video.service");
const config_1 = require("./config/config");
class VideoGenerator {
    constructor() {
        this.openAIService = new openai_service_1.OpenAIService();
        this.elevenLabsService = new elevenlabs_service_1.ElevenLabsService();
        this.videoService = new video_service_1.VideoService();
    }
    async generate(prompt) {
        try {
            await this.videoService.ensureDirectories();
            // Configuration for video generation
            const generationConfig = {
                prompt,
                duration: 60, // 1 minute video
                chunkCount: 8, // Split into 8 segments
            };
            const videoConfig = {
                outputPath: path_1.default.join(config_1.config.video.outputDir, 'final-video.mp4'),
                width: config_1.config.video.defaultWidth,
                height: config_1.config.video.defaultHeight,
                fps: config_1.config.video.fps,
            };
            console.log('Generating video chunks from prompt...');
            const preChunks = await this.openAIService.generateChunks(generationConfig);
            const postChunks = await this.processChunks(preChunks, videoConfig);
            console.log('\nCombining video chunks...');
            await this.videoService.combineChunks(postChunks, videoConfig.outputPath);
            // Get and log the final video duration
            const finalDuration = await this.videoService.getVideoDuration(videoConfig.outputPath);
            console.log(`\nFinal video duration: ${finalDuration.toFixed(2)} seconds`);
            console.log('Cleaning up temporary files...');
            await this.videoService.cleanup();
            return videoConfig.outputPath;
        }
        catch (error) {
            console.error('Error generating video:', error);
            await this.videoService.cleanup();
            throw error;
        }
    }
    async processChunks(preChunks, videoConfig) {
        const postChunks = [];
        for (let i = 0; i < preChunks.length; i++) {
            console.log(`\nProcessing chunk ${i + 1}/${preChunks.length}...`);
            const chunk = preChunks[i];
            // Generate image
            const imagePath = await this.openAIService.generateImage(chunk.description, i);
            console.log(`Generated image for chunk ${i + 1}`);
            // Generate audio
            const audioPath = await this.elevenLabsService.generateSpeech(chunk.ssml, i);
            console.log(`Generated audio for chunk ${i + 1}`);
            // Get audio duration
            const duration = await this.elevenLabsService.getAudioDuration(audioPath);
            console.log(`Chunk ${i + 1} audio duration: ${duration.toFixed(2)} seconds`);
            // Create video chunk
            const videoChunkPath = await this.videoService.createVideoChunk(imagePath, audioPath, i, videoConfig);
            // Verify chunk duration
            const chunkDuration = await this.videoService.getVideoDuration(videoChunkPath);
            console.log(`Chunk ${i + 1} video duration: ${chunkDuration.toFixed(2)} seconds`);
            postChunks.push({
                imagePath,
                audioPath,
                duration
            });
        }
        return postChunks;
    }
}
exports.VideoGenerator = VideoGenerator;
