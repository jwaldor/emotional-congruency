'use client';

import { SentenceEmotion } from '@/types/analysis';

interface SentenceLevelEmotionsProps {
  sentenceEmotions: SentenceEmotion[];
  className?: string;
}

export default function SentenceLevelEmotions({ sentenceEmotions, className = '' }: SentenceLevelEmotionsProps) {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        Sentence-by-Sentence Emotional Analysis
      </h3>
      <div className="space-y-6">
        {sentenceEmotions.map((sentenceEmotion, index) => {
          const topEmotions = sentenceEmotion.emotions.slice(0, 3);
          
          return (
            <div key={index} className="border-l-4 border-blue-400 pl-4 py-2">
              <div className="mb-3">
                <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  Sentence {index + 1}
                </span>
                {sentenceEmotion.startTime && sentenceEmotion.endTime && (
                  <span className="text-xs text-gray-500 ml-2">
                    {sentenceEmotion.startTime.toFixed(1)}s - {sentenceEmotion.endTime.toFixed(1)}s
                  </span>
                )}
              </div>
              
              <blockquote className="text-gray-700 italic mb-3 text-sm leading-relaxed">
                "{sentenceEmotion.sentence}"
              </blockquote>
              
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Top Emotions Detected:
                </p>
                <div className="flex flex-wrap gap-2">
                  {topEmotions.map((emotion, emotionIndex) => (
                    <div
                      key={emotion.name}
                      className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${
                        emotionIndex === 0
                          ? 'bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border border-purple-200'
                          : emotionIndex === 1
                          ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 border border-blue-200'
                          : 'bg-gray-50 text-gray-600 border border-gray-200'
                      }`}
                    >
                      <span>{emotion.name}</span>
                      <span className="font-semibold">
                        {(emotion.score * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {sentenceEmotions.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No sentence-level emotion data available.</p>
        </div>
      )}
    </div>
  );
}
