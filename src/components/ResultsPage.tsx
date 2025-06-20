'use client';

import { useState, useEffect } from 'react';
import { useChat } from 'ai/react';
import toast from 'react-hot-toast';

interface EmotionScore {
  name: string;
  score: number;
}

interface ResultsPageProps {
  audioBlob: Blob;
}

interface AnalysisData {
  transcript: string;
  emotions: EmotionScore[];
  insights: string;
}

export default function ResultsPage({ audioBlob }: ResultsPageProps) {
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);

  // Initialize chat with pre-filled message
  const { messages, input, handleInputChange, handleSubmit, isLoading: isChatLoading } = useChat({
    api: '/api/chat',
    initialInput: '', // Will be set after analysis completes
  });

  useEffect(() => {
    analyzeAudio();
  }, []);

  const analyzeAudio = async () => {
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

      // Update state with partial data
      setAnalysisData({ transcript, emotions, insights: '' });
      setIsAnalyzing(false);
      setIsGeneratingInsights(true);

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

      // Update with complete data
      setAnalysisData({ transcript, emotions, insights });
      setIsGeneratingInsights(false);

    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Analysis failed. Please try again.');
      setIsAnalyzing(false);
      setIsGeneratingInsights(false);
    }
  };

  const generateChatPrompt = () => {
    if (!analysisData) return '';
    
    const top10Emotions = analysisData.emotions.slice(0, 10)
      .map((emotion, index) => `${index + 1}. ${emotion.name} (${(emotion.score * 100).toFixed(1)}%)`)
      .join('\n');

    return `Based on my voice analysis, here are my results:

TRANSCRIPT:
"${analysisData.transcript}"

TOP 10 EMOTIONS DETECTED:
${top10Emotions}

I'd like to understand more about what these emotions might reveal about my communication style and underlying thoughts. What patterns do you notice?`;
  };

  const displayEmotions = analysisData?.emotions.slice(0, 10) || [];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Transcript Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Transcript
        </h3>
        <div className="bg-gray-50 rounded-lg p-4">
          {isAnalyzing ? (
            <div className="flex items-center space-x-3">
              <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              <span className="text-gray-600">Transcribing and analyzing...</span>
            </div>
          ) : (
            <p className="text-gray-700 leading-relaxed">
              {analysisData?.transcript || 'No transcript available'}
            </p>
          )}
        </div>
      </div>

      {/* Emotions Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Detected Emotions
          <span className="text-sm font-normal text-gray-500 ml-2">
            (Top 3 analyzed by AI)
          </span>
        </h3>
        <div className="space-y-3">
          {isAnalyzing ? (
            <div className="flex items-center space-x-3">
              <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              <span className="text-gray-600">Analyzing emotional patterns...</span>
            </div>
          ) : (
            displayEmotions.map((emotion, index) => {
              const isTopThree = index < 3;
              return (
                <div key={emotion.name} className="flex items-center space-x-4">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    isTopThree 
                      ? 'bg-blue-100 border-2 border-blue-300' 
                      : 'bg-gray-100'
                  }`}>
                    <span className={`font-semibold text-sm ${
                      isTopThree ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {index + 1}
                    </span>
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-center mb-1">
                      <span className={`capitalize ${
                        isTopThree 
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
                        className={`h-2 rounded-full transition-all duration-500 ${
                          isTopThree 
                            ? 'bg-gradient-to-r from-blue-400 to-blue-600' 
                            : 'bg-gradient-to-r from-gray-300 to-gray-400'
                        }`}
                        style={{ width: `${emotion.score * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* AI Insights Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          AI Emotional Insights
        </h3>
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6">
          {isGeneratingInsights ? (
            <div className="flex items-center space-x-3">
              <div className="animate-spin w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full"></div>
              <span className="text-gray-600">Generating personalized insights...</span>
            </div>
          ) : analysisData?.insights ? (
            <div className="prose prose-gray max-w-none">
              {analysisData.insights.split('\n').map((paragraph, index) => (
                paragraph.trim() && (
                  <p key={index} className="text-gray-700 leading-relaxed mb-4 last:mb-0">
                    {paragraph.trim()}
                  </p>
                )
              ))}
            </div>
          ) : (
            <p className="text-gray-600">Insights will appear here once analysis is complete.</p>
          )}
        </div>
      </div>

      {/* Chat Section - Only show after insights are generated */}
      {analysisData?.insights && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Continue the Conversation
          </h3>
          <p className="text-gray-600 mb-4">
            Ask questions about your emotional analysis or explore deeper insights with AI.
          </p>
          
          {/* Chat Messages */}
          <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            ))}
            {isChatLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full"></div>
                    <span className="text-sm">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <textarea
              value={input || generateChatPrompt()}
              onChange={handleInputChange}
              placeholder="Ask about your emotional analysis..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
            />
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => handleInputChange({ target: { value: generateChatPrompt() } } as any)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Reset to default prompt
              </button>
              <button
                type="submit"
                disabled={isChatLoading || !input.trim()}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isChatLoading ? 'Sending...' : 'Send'}
              </button>
            </div>
          </form>
        </div>
      )}

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
