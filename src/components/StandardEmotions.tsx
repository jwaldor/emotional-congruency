'use client';

import { EmotionScore } from '@/types/analysis';

interface StandardEmotionsProps {
  emotions: EmotionScore[];
  analyzedEmotions: EmotionScore[];
  className?: string;
}

export default function StandardEmotions({ emotions, analyzedEmotions, className = '' }: StandardEmotionsProps) {
  const displayEmotions = emotions.slice(0, 10);

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        Detected Emotions
        <span className="text-sm font-normal text-gray-500 ml-2">
          (Top {analyzedEmotions.length} analyzed by AI)
        </span>
      </h3>
      <div className="space-y-3">
        {displayEmotions.map((emotion, index) => {
          const isAnalyzed = analyzedEmotions.some(ae => ae.name === emotion.name);

          return (
            <div key={emotion.name} className="flex items-center space-x-4">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isAnalyzed
                ? 'bg-blue-100 border-2 border-blue-300'
                : 'bg-gray-100'
                }`}>
                <span className={`font-semibold text-sm ${isAnalyzed ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                  {index + 1}
                </span>
              </div>
              <div className="flex-grow">
                <div className="flex justify-between items-center mb-1">
                  <span className={`capitalize ${isAnalyzed
                    ? 'font-medium text-gray-800'
                    : 'font-normal text-gray-600'
                    }`}>
                    {emotion.name}
                    {isAnalyzed && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                        AI Analyzed
                      </span>
                    )}
                  </span>
                  <span className="text-sm text-gray-600">
                    {(emotion.score * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${isAnalyzed
                      ? 'bg-gradient-to-r from-blue-400 to-blue-600'
                      : 'bg-gradient-to-r from-gray-300 to-gray-400'
                      }`}
                    style={{ width: `${emotion.score * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {displayEmotions.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No emotion data available.</p>
        </div>
      )}

      {analyzedEmotions.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-2 text-sm text-blue-700">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="font-medium">
              {analyzedEmotions.length} emotion{analyzedEmotions.length !== 1 ? 's' : ''} analyzed by AI
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
