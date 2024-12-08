# AI Video Generator

This Node.js application generates short 1-minute videos by combining AI-generated images and speech. It uses OpenAI's DALL-E for image generation, ElevenLabs for text-to-speech, and FFmpeg for video processing.

## Features

- Generates 1-minute videos split into multiple segments
- Uses DALL-E 3 for high-quality image generation
- Converts text to natural-sounding speech using ElevenLabs
- Automatically stitches segments together into a final video

## Prerequisites

- Node.js 16 or higher
- FFmpeg (automatically installed via dependencies)
- OpenAI API key
- ElevenLabs API key

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd shorts-demo
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Open `.env` and add your API keys:
     - Get your OpenAI API key from [OpenAI Platform](https://platform.openai.com/account/api-keys)
     - Get your ElevenLabs API key from [ElevenLabs Subscription](https://elevenlabs.io/subscription)
     - For the ElevenLabs voice ID, you can either:
       - Use the default voice ID already provided in `.env.example`
       - Or get your own voice ID from [ElevenLabs Voices](https://api.elevenlabs.io/v1/voices)

## Usage

1. Build the project:

```bash
npm run build
```

2. Run the application:

```bash
npm start
```

3. When prompted, enter your video prompt. The application will:
   - Generate multiple video segments based on your prompt
   - Create images and audio for each segment
   - Combine everything into a final video
   - Output the video to the `output` directory

For development, you can use:

```bash
npm run dev
```

## Project Structure

- `src/`
  - `types/` - TypeScript interfaces
  - `services/` - API integrations and video processing
  - `config/` - Configuration and environment variables
  - `VideoGenerator.ts` - Main orchestration class
  - `main.ts` - Entry point

## Output

Generated videos will be saved in the `output` directory as MP4 files. Temporary files are automatically cleaned up after processing.

## Cleaning Up

To remove generated files:

```bash
npm run clean
```

This will remove the `dist`, `temp`, and `output` directories.

## Environment Variables

The following environment variables are required:

- `OPENAI_API_KEY`: Your OpenAI API key
- `ELEVENLABS_API_KEY`: Your ElevenLabs API key
- `ELEVENLABS_VOICE_ID`: Voice ID for text-to-speech (default provided in `.env.example`)

Make sure to never commit your `.env` file containing your actual API keys.
