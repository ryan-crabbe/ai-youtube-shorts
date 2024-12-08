export interface PreChunk {
  description: string;  // Description for DALL-E image generation
  ssml: string;        // SSML text with break tags for ElevenLabs
}

export interface PostChunk {
  imagePath: string;   // Path to generated image
  audioPath: string;   // Path to generated audio
  duration: number;    // Duration of the chunk in seconds
}

export interface VideoConfig {
  outputPath: string;
  width: number;
  height: number;
  fps: number;
}

export interface GenerationConfig {
  prompt: string;      // Main video prompt
  duration: number;    // Target duration in seconds
  chunkCount: number;  // Number of chunks to generate
}
