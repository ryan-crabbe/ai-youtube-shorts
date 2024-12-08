"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoService = void 0;
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const ffmpeg_1 = __importDefault(require("@ffmpeg-installer/ffmpeg"));
const ffprobe_1 = __importDefault(require("@ffprobe-installer/ffprobe"));
const config_1 = require("../config/config");
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
// Set both ffmpeg and ffprobe paths
fluent_ffmpeg_1.default.setFfmpegPath(ffmpeg_1.default.path);
fluent_ffmpeg_1.default.setFfprobePath(ffprobe_1.default.path);
class VideoService {
    async createVideoChunk(imagePath, audioPath, index, videoConfig) {
        const outputPath = path_1.default.join(config_1.config.video.tempDir, `chunk-${index}.mp4`);
        // First, get the exact audio duration
        const audioDuration = await this.getAudioDuration(audioPath);
        return new Promise((resolve, reject) => {
            (0, fluent_ffmpeg_1.default)()
                .input(imagePath)
                .inputOptions(['-loop 1']) // Loop the image
                .input(audioPath)
                .outputOptions([
                `-vf scale=${videoConfig.width}:${videoConfig.height}`,
                `-r ${videoConfig.fps}`,
                '-c:v libx264',
                '-pix_fmt yuv420p',
                '-shortest', // End when the shortest input ends
                '-avoid_negative_ts make_zero',
                `-t ${audioDuration}`, // Explicitly set the duration to match audio
                '-max_interleave_delta 0'
            ])
                .output(outputPath)
                .on('end', () => resolve(outputPath))
                .on('error', (err) => reject(err))
                .run();
        });
    }
    async combineChunks(chunks, outputPath) {
        // Create a temporary file list for ffmpeg
        const fileListPath = path_1.default.join(config_1.config.video.tempDir, 'filelist.txt');
        const fileListContent = chunks
            .map((_, index) => `file 'chunk-${index}.mp4'`)
            .join('\n');
        await promises_1.default.writeFile(fileListPath, fileListContent);
        // Ensure output directory exists
        await promises_1.default.mkdir(path_1.default.dirname(outputPath), { recursive: true });
        return new Promise((resolve, reject) => {
            (0, fluent_ffmpeg_1.default)()
                .input(fileListPath)
                .inputOptions(['-f concat', '-safe 0'])
                .outputOptions([
                '-c copy',
                '-movflags +faststart'
            ])
                .output(outputPath)
                .on('end', () => resolve())
                .on('error', (err) => reject(err))
                .run();
        });
    }
    async cleanup() {
        try {
            await promises_1.default.rm(config_1.config.video.tempDir, { recursive: true, force: true });
        }
        catch (error) {
            console.error('Error cleaning up temporary files:', error);
        }
    }
    async ensureDirectories() {
        await promises_1.default.mkdir(config_1.config.video.tempDir, { recursive: true });
        await promises_1.default.mkdir(config_1.config.video.outputDir, { recursive: true });
    }
    async getVideoDuration(videoPath) {
        return new Promise((resolve, reject) => {
            fluent_ffmpeg_1.default.ffprobe(videoPath, (err, metadata) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(metadata.format.duration || 0);
            });
        });
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
exports.VideoService = VideoService;
