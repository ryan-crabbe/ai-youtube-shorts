"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoGeneration = exports.VideoSegment = void 0;
const zod_1 = require("zod");
exports.VideoSegment = zod_1.z.object({
    description: zod_1.z.string().describe('A detailed visual description for DALL-E image generation'),
    ssml: zod_1.z.string().describe('Speech text with SSML break tags for natural pauses'),
});
exports.VideoGeneration = zod_1.z.object({
    segments: zod_1.z.array(exports.VideoSegment),
});
