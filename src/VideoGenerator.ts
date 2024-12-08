import path from 'path';
import { OpenAIService } from './services/openai.service';
import { ElevenLabsService } from './services/elevenlabs.service';
import { VideoService } from './services/video.service';
import { GenerationConfig, PreChunk, PostChunk, VideoConfig } from './types/chunk';
import { config } from './config/config';

export class VideoGenerator {
  private openAIService: OpenAIService;
  private elevenLabsService: ElevenLabsService;
  private videoService: VideoService;

  constructor() {
    this.openAIService = new OpenAIService();
    this.elevenLabsService = new ElevenLabsService();
    this.videoService = new VideoService();
  }

  async generate(prompt: string): Promise<string> {
    try {
      await this.videoService.ensureDirectories();

      // Configuration for video generation
      const generationConfig: GenerationConfig = {
        prompt,
        duration: 60, // 1 minute video
        chunkCount: 8, // Split into 8 segments
      };

      const videoConfig: VideoConfig = {
        outputPath: path.join(config.video.outputDir, 'final-video.mp4'),
        width: config.video.defaultWidth,
        height: config.video.defaultHeight,
        fps: config.video.fps,
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
    } catch (error) {
      console.error('Error generating video:', error);
      await this.videoService.cleanup();
      throw error;
    }
  }

  private async processChunks(preChunks: PreChunk[], videoConfig: VideoConfig): Promise<PostChunk[]> {
    const postChunks: PostChunk[] = [];

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
      const videoChunkPath = await this.videoService.createVideoChunk(
        imagePath,
        audioPath,
        i,
        videoConfig
      );

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
