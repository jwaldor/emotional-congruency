'use client';

import { useState } from 'react';
import VoiceRecorder from '@/components/VoiceRecorder';
import ResultsPage from '@/components/ResultsPage';

export default function Home() {
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const handleRecordingComplete = (blob: Blob) => {
    setAudioBlob(blob);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {!audioBlob ? (
          <VoiceRecorder
            onRecordingComplete={handleRecordingComplete}
            isProcessing={false}
          />
        ) : (
          <ResultsPage audioBlob={audioBlob} />
        )}
      </div>
    </div>
  );
}
