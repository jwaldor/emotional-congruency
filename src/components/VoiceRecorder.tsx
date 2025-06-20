'use client';

import { useState, useRef, useEffect } from 'react';
import { AudioRecorder, formatDuration } from '@/lib/audio-utils';
import toast from 'react-hot-toast';

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  isProcessing: boolean;
}

export default function VoiceRecorder({ onRecordingComplete, isProcessing }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check microphone permission on component mount
    checkMicrophonePermission();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const checkMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setHasPermission(true);
    } catch (error) {
      setHasPermission(false);
      console.error('Microphone permission denied:', error);
    }
  };

  const startRecording = async () => {
    try {
      if (!audioRecorderRef.current) {
        audioRecorderRef.current = new AudioRecorder();
      }

      await audioRecorderRef.current.startRecording();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast.success('Recording started');
    } catch (error) {
      toast.error('Failed to start recording. Please check microphone permissions.');
      console.error('Recording error:', error);
    }
  };

  const stopRecording = async () => {
    try {
      if (!audioRecorderRef.current) return;

      const audioBlob = await audioRecorderRef.current.stopRecording();
      setIsRecording(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      toast.success('Recording completed');
      onRecordingComplete(audioBlob);
    } catch (error) {
      toast.error('Failed to stop recording');
      console.error('Stop recording error:', error);
    }
  };

  if (hasPermission === false) {
    return (
      <div className="text-center p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Microphone Access Required
          </h3>
          <p className="text-red-600 mb-4">
            Please allow microphone access to record your voice.
          </p>
          <button
            onClick={checkMicrophonePermission}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Check Permission Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center p-8 max-w-4xl mx-auto">
      {/* Main Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold mb-2 bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent drop-shadow-sm flex items-center justify-center gap-2">
          <span role="img" aria-label="wave">🎤</span>
          Voice Emotion Analysis
        </h1>
        <div className="flex justify-center mb-5">
          <div className="h-0.5 w-20 bg-gradient-to-r from-blue-300 to-indigo-300 rounded-full opacity-70"></div>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            📝 Do a voice journal about what&apos;s alive for you
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Share what&apos;s on your mind, how you&apos;re feeling, or what&apos;s happening in your life.
            Our AI will analyze the emotions in your voice and provide insights about your emotional patterns.
          </p>
        </div>
      </div>

      {/* Warning Section */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-center mb-3">
            <div className="bg-amber-100 rounded-full p-2 mr-3">
              <svg className="w-6 h-6 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-amber-800">
              ⚠️ This might show you some blindspots!
            </h3>
          </div>
          <p className="text-amber-800 font-medium">
            Take care of yourself and do this only if you are emotionally open and resilient.
            This analysis may reveal patterns you weren&apos;t aware of.
          </p>
        </div>
      </div>

      {/* Recording Section */}
      <div className="mb-8">
        {isRecording && (
          <div className="mb-6 bg-red-50 rounded-xl p-4">
            <div className="text-3xl font-mono text-red-600 mb-2">
              {formatDuration(recordingTime)}
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-600 font-medium">Recording your voice journal...</span>
            </div>
          </div>
        )}

        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          className={`
            w-28 h-28 rounded-full border-4 transition-all duration-200
            ${isRecording
              ? 'bg-red-500 border-red-600 hover:bg-red-600'
              : 'bg-blue-500 border-blue-600 hover:bg-blue-600'
            }
            ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
            text-white font-semibold shadow-xl
          `}
        >
          {isProcessing ? (
            <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto"></div>
          ) : isRecording ? (
            <div className="w-8 h-8 bg-white rounded mx-auto"></div>
          ) : (
            <svg className="w-10 h-10 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 715 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
            </svg>
          )}
        </button>

        <div className="mt-6">
          <p className="text-lg text-gray-600 font-medium">
            {isRecording ? 'Click to stop recording' : 'Click to start your voice journal'}
          </p>
          {!isRecording && (
            <p className="text-sm text-gray-500 mt-2">
              Speak naturally about what&apos;s on your mind
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
