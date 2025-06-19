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
    <div className="text-center p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Voice Emotion Analysis
        </h2>
        <p className="text-gray-600">
          Record your voice to analyze emotions and get AI insights
        </p>
      </div>

      <div className="mb-8">
        {isRecording && (
          <div className="mb-4">
            <div className="text-3xl font-mono text-red-600 mb-2">
              {formatDuration(recordingTime)}
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-600 font-medium">Recording...</span>
            </div>
          </div>
        )}

        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          className={`
            w-24 h-24 rounded-full border-4 transition-all duration-200 
            ${isRecording 
              ? 'bg-red-500 border-red-600 hover:bg-red-600' 
              : 'bg-blue-500 border-blue-600 hover:bg-blue-600'
            }
            ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
            text-white font-semibold shadow-lg
          `}
        >
          {isProcessing ? (
            <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto"></div>
          ) : isRecording ? (
            <div className="w-6 h-6 bg-white rounded mx-auto"></div>
          ) : (
            <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
            </svg>
          )}
        </button>

        <div className="mt-4 text-sm text-gray-500">
          {isRecording ? 'Click to stop recording' : 'Click to start recording'}
        </div>
      </div>
    </div>
  );
}
