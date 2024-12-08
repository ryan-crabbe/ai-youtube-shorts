import axios from 'axios';
import { config } from '../config/config';
import fs from 'fs/promises';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import ffprobeInstaller from '@ffprobe-installer/ffprobe';

ffmpeg.setFfprobePath(ffprobeInstaller.path);

export class ElevenLabsService {
  private readonly baseUrl = 'https://api.elevenlabs.io/v1';
  private readonly headers: Record<string, string>;

  constructor() {
    this.headers = {
      'Accept': 'audio/mpeg',
      'xi-api-key': config.elevenLabs.apiKey,
      'Content-Type': 'application/json',
    };
  }

  async generateSpeech(ssml: string, index: number): Promise<string> {
    const url = `${this.baseUrl}/text-to-speech/${config.elevenLabs.voiceId}`;
    
    try {
      const response = await axios.post(
        url,
        {
          text: ssml,
          model_id: config.elevenLabs.modelId,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        },
        {
          headers: this.headers,
          responseType: 'arraybuffer',
        }
      );

      await fs.mkdir(config.video.tempDir, { recursive: true });
      const audioPath = path.join(config.video.tempDir, `audio-${index}.mp3`);
      await fs.writeFile(audioPath, response.data);

      return audioPath;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`ElevenLabs API error: ${error.response?.data || error.message}`);
      }
      throw error;
    }
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
