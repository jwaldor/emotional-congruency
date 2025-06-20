'use client';

import { useState } from 'react';
import VoiceRecorder from '@/components/VoiceRecorder';
import EmotionResults from '@/components/EmotionResults';
import toast from 'react-hot-toast';

interface EmotionScore {
  name: string;
  score: number;
}

interface AnalysisResults {
  transcript: string;
  emotions: EmotionScore[];
  insights: string;
}

export default function Home() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<AnalysisResults | null>(null);

  const handleRecordingComplete = async (audioBlob: Blob) => {
    setIsProcessing(true);

    try {
      // Step 1: Analyze emotions and get transcript from Hume
      toast.loading('Analyzing emotions and transcribing...', { id: 'analyze' });

      const emotionFormData = new FormData();
      emotionFormData.append('audio', audioBlob, 'recording.webm');

      const emotionResponse = await fetch('/api/analyze-emotions', {
        method: 'POST',
        body: emotionFormData,
      });

      if (!emotionResponse.ok) {
        throw new Error('Failed to analyze emotions');
      }

      const { emotions, transcript } = await emotionResponse.json();
      toast.success('Analysis and transcription complete!', { id: 'analyze' });

      // Step 2: Generate insights
      toast.loading('Generating AI insights...', { id: 'insights' });

      const insightResponse = await fetch('/api/generate-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcript,
          topEmotions: emotions.slice(0, 3),
        }),
      });

      if (!insightResponse.ok) {
        throw new Error('Failed to generate insights');
      }

      const { insights } = await insightResponse.json();
      toast.success('Analysis complete!', { id: 'insights' });

      // Set results
      setResults({
        transcript,
        emotions,
        insights,
      });

    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Analysis failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {!results ? (
          <VoiceRecorder
            onRecordingComplete={handleRecordingComplete}
            isProcessing={isProcessing}
          />
        ) : (
          <EmotionResults
            transcript={results.transcript}
            emotions={results.emotions}
            insights={results.insights}
          />
        )}
      </div>
    </div>
  );
}
