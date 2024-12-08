import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import ffprobeInstaller from '@ffprobe-installer/ffprobe';
import { PostChunk, VideoConfig } from '../types/chunk';
import { config } from '../config/config';
import path from 'path';
import fs from 'fs/promises';

// Set both ffmpeg and ffprobe paths
ffmpeg.setFfmpegPath(ffmpegInstaller.path);
ffmpeg.setFfprobePath(ffprobeInstaller.path);

export class VideoService {
  async createVideoChunk(
    imagePath: string,
    audioPath: string,
    index: number,
    videoConfig: VideoConfig
  ): Promise<string> {
    const outputPath = path.join(config.video.tempDir, `chunk-${index}.mp4`);

    // First, get the exact audio duration
    const audioDuration = await this.getAudioDuration(audioPath);

    return new Promise((resolve, reject) => {
      ffmpeg()
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

  async combineChunks(chunks: PostChunk[], outputPath: string): Promise<void> {
    // Create a temporary file list for ffmpeg
    const fileListPath = path.join(config.video.tempDir, 'filelist.txt');
    const fileListContent = chunks
      .map((_, index) => `file 'chunk-${index}.mp4'`)
      .join('\n');
    
    await fs.writeFile(fileListPath, fileListContent);

    // Ensure output directory exists
    await fs.mkdir(path.dirname(outputPath), { recursive: true });

    return new Promise((resolve, reject) => {
      ffmpeg()
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

  async cleanup(): Promise<void> {
    try {
      await fs.rm(config.video.tempDir, { recursive: true, force: true });
    } catch (error) {
      console.error('Error cleaning up temporary files:', error);
    }
  }

  async ensureDirectories(): Promise<void> {
    await fs.mkdir(config.video.tempDir, { recursive: true });
    await fs.mkdir(config.video.outputDir, { recursive: true });
  }

  async getVideoDuration(videoPath: string): Promise<number> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(metadata.format.duration || 0);
      });
    });
  }

  async getAudioDuration(audioPath: string): Promise<number> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(audioPath, (err, metadata) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(metadata.format.duration || 0);
      });
    });
  }
}
