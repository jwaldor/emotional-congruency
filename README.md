# Voice Emotion Analysis App

A Next.js application that records voice, analyzes emotions and transcribes speech using Hume AI, and provides emotional insights using Claude AI.

## Features

- 🎤 **Voice Recording**: Browser-based audio recording with real-time feedback
- 📝 **Speech Transcription**: Built-in transcription via Hume AI
- 😊 **Emotion Analysis**: Advanced vocal emotion detection using Hume AI
- 🧠 **AI Insights**: Personalized emotional awareness insights from Claude 3.5 Sonnet
- 🔔 **Real-time Feedback**: Toast notifications for each processing step
- 📱 **Responsive Design**: Works on desktop and mobile devices

## How It Works

1. **Record**: Click the microphone button to start/stop voice recording
2. **Analyze**: Hume AI analyzes the audio for emotional patterns and transcribes speech
3. **Insights**: Claude AI provides personalized insights about detected emotions
4. **Results**: View transcript, emotion scores, and AI-generated insights

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory with your API keys:

```env
# Hume AI API Key (get from https://platform.hume.ai/settings/keys)
HUME_API_KEY=your_hume_api_key_here

# OpenRouter API Key (get from https://openrouter.ai/keys)
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

### 3. Get API Keys

#### Hume AI API Key

1. Visit [Hume AI Platform](https://platform.hume.ai/settings/keys)
2. Sign up/login and create a new API key
3. Copy the key to your `.env.local` file

#### OpenRouter API Key

1. Visit [OpenRouter](https://openrouter.ai/keys)
2. Sign up/login and create a new API key
3. Copy the key to your `.env.local` file

### 4. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Grant Microphone Permission**: Allow microphone access when prompted
2. **Record Your Voice**: Click the blue microphone button to start recording
3. **Stop Recording**: Click the red stop button when finished
4. **Wait for Analysis**: The app will process your recording through two stages:
   - Analyzing emotions and transcribing (Hume AI)
   - Generating insights (Claude AI)
5. **View Results**: See your transcript, top 10 emotions (with AI insights for top 3), and personalized analysis
6. **Analyze Again**: Click "Analyze Another Recording" to start over

## Technical Details

### Architecture

- **Frontend**: Next.js 15 with React and TypeScript
- **Styling**: Tailwind CSS
- **Audio Recording**: Browser MediaRecorder API
- **Notifications**: React Hot Toast

### APIs Used

- **Hume Expression Measurement API**: Vocal emotion analysis and speech transcription
- **OpenRouter + Claude 3.5 Sonnet**: AI insights generation

### Audio Processing

- Records in WebM format with Opus codec
- Optimized for speech with echo cancellation and noise suppression
- Supports recordings up to 3 hours (Hume API limit)

## Troubleshooting

### Microphone Issues

- Ensure microphone permissions are granted
- Check browser compatibility (Chrome/Firefox recommended)
- Verify microphone is not being used by other applications

### API Errors

- Verify all API keys are correctly set in `.env.local`
- Check API key permissions and quotas
- Ensure stable internet connection

### Processing Timeouts

- Hume API processing may take 10-30 seconds for longer recordings
- The app will timeout after 30 seconds and show an error
- Try shorter recordings if experiencing timeouts

## Browser Compatibility

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 14+
- ✅ Edge 79+

## License

MIT License
