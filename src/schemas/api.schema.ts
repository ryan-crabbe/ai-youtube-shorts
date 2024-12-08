import { z } from 'zod';

export const VideoSegment = z.object({
  description: z.string().describe('A detailed visual description for DALL-E image generation'),
  ssml: z.string().describe('Speech text with SSML break tags for natural pauses'),
});

export const VideoGeneration = z.object({
  segments: z.array(VideoSegment),
});

export type VideoSegmentType = z.infer<typeof VideoSegment>;
export type VideoGenerationType = z.infer<typeof VideoGeneration>;
