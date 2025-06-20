'use client';

interface EmotionScore {
  name: string;
  score: number;
}

interface EmotionResultsProps {
  transcript: string;
  emotions: EmotionScore[];
  insights: string;
}

export default function EmotionResults({ transcript, emotions, insights }: EmotionResultsProps) {
  const displayEmotions = emotions.slice(0, 10); // Display top 10 emotions

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Transcript Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Transcript
        </h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-gray-700 leading-relaxed">
            {transcript || 'No transcript available'}
          </p>
        </div>
      </div>

      {/* Top Emotions Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Detected Emotions
          <span className="text-sm font-normal text-gray-500 ml-2">
            (Top 3 analyzed by AI)
          </span>
        </h3>
        <div className="space-y-3">
          {displayEmotions.map((emotion, index) => {
            const isTopThree = index < 3;
            return (
              <div key={emotion.name} className="flex items-center space-x-4">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isTopThree
                  ? 'bg-blue-100 border-2 border-blue-300'
                  : 'bg-gray-100'
                  }`}>
                  <span className={`font-semibold text-sm ${isTopThree ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                    {index + 1}
                  </span>
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-center mb-1">
                    <span className={`capitalize ${isTopThree
                      ? 'font-medium text-gray-800'
                      : 'font-normal text-gray-600'
                      }`}>
                      {emotion.name}
                      {isTopThree && (
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
                      className={`h-2 rounded-full transition-all duration-500 ${isTopThree
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
      </div>

      {/* AI Insights Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          AI Emotional Insights
        </h3>
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6">
          <div className="prose prose-gray max-w-none">
            {insights.split('\n').map((paragraph, index) => (
              paragraph.trim() && (
                <p key={index} className="text-gray-700 leading-relaxed mb-4 last:mb-0">
                  {paragraph.trim()}
                </p>
              )
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Analyze Another Recording
        </button>
      </div>
    </div>
  );
}
