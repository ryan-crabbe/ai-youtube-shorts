import { VideoGenerator } from './VideoGenerator';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function main() {
  try {
    const prompt = await new Promise<string>((resolve) => {
      rl.question('Enter your prompt for a 1-minute video: ', (answer) => {
        resolve(answer);
      });
    });

    console.log('\nStarting video generation process...');
    const videoGenerator = new VideoGenerator();
    const outputPath = await videoGenerator.generate(prompt);
    
    console.log(`\nVideo generation complete! Your video is available at: ${outputPath}`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    rl.close();
  }
}

main();
