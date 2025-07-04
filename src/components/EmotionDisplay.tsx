'use client';

import { AnalysisData } from '@/types/analysis';
import StandardEmotions from './StandardEmotions';
import SentenceLevelEmotions from './SentenceLevelEmotions';

interface EmotionDisplayProps {
  analysisData: AnalysisData;
  className?: string;
}

export default function EmotionDisplay({ analysisData, className = '' }: EmotionDisplayProps) {
  const { analysisType, displayType, emotions, analyzedEmotions, sentenceEmotions } = analysisData;

  // Use displayType if available, otherwise fall back to analysisType logic
  const shouldShowSentenceLevel = displayType === 'sentence-level' ||
    (analysisType === 'sentence-level' && sentenceEmotions && sentenceEmotions.length > 0);

  // For sentence-level display, show both sentence-level and standard emotions
  if (shouldShowSentenceLevel && sentenceEmotions && sentenceEmotions.length > 0) {
    return (
      <div className={`space-y-6 ${className}`}>
        {/* Sentence-level emotions - primary display */}
        <SentenceLevelEmotions sentenceEmotions={sentenceEmotions} />

        {/* Overall emotions summary */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Overall Emotion Summary
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            These are the aggregated emotions across all sentences:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {emotions.slice(0, 6).map((emotion, index) => {
              const isAnalyzed = analyzedEmotions.some(ae => ae.name === emotion.name);

              return (
                <div
                  key={emotion.name}
                  className={`p-3 rounded-lg border transition-all duration-200 ${isAnalyzed
                      ? 'bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200'
                      : 'bg-gray-50 border-gray-200'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-medium text-sm ${isAnalyzed ? 'text-gray-800' : 'text-gray-600'
                      }`}>
                      {emotion.name}
                    </span>
                    <span className={`text-sm font-semibold ${isAnalyzed ? 'text-blue-600' : 'text-gray-500'
                      }`}>
                      {(emotion.score * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-500 ${isAnalyzed
                          ? 'bg-gradient-to-r from-blue-400 to-blue-600'
                          : 'bg-gradient-to-r from-gray-300 to-gray-400'
                        }`}
                      style={{ width: `${emotion.score * 100}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // For standard and actions analysis, show standard emotion display
  return (
    <StandardEmotions
      emotions={emotions}
      analyzedEmotions={analyzedEmotions}
      className={className}
    />
  );
}
