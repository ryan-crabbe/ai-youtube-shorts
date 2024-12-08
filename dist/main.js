"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const VideoGenerator_1 = require("./VideoGenerator");
const readline_1 = __importDefault(require("readline"));
const rl = readline_1.default.createInterface({
    input: process.stdin,
    output: process.stdout
});
async function main() {
    try {
        const prompt = await new Promise((resolve) => {
            rl.question('Enter your prompt for a 1-minute video: ', (answer) => {
                resolve(answer);
            });
        });
        console.log('\nStarting video generation process...');
        const videoGenerator = new VideoGenerator_1.VideoGenerator();
        const outputPath = await videoGenerator.generate(prompt);
        console.log(`\nVideo generation complete! Your video is available at: ${outputPath}`);
    }
    catch (error) {
        console.error('Error:', error);
    }
    finally {
        rl.close();
    }
}
main();
