'use client';

import { useState, useEffect } from 'react';
import { useChat } from 'ai/react';
import toast from 'react-hot-toast';

interface SavedResult {
  id: string;
  inputText: string;
  analysisText: string;
  createdAt: string;
  updatedAt: string;
}

interface SavedResultsPageProps {
  resultId: string;
}

export default function SavedResultsPage({ resultId }: SavedResultsPageProps) {
  const [result, setResult] = useState<SavedResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize chat with pre-filled message
  const { messages, input, handleInputChange, handleSubmit, isLoading: isChatLoading } = useChat({
    api: '/api/chat',
    initialInput: '', // Will be set after result loads
  });

  useEffect(() => {
    fetchResult();
  }, [resultId]);

  const fetchResult = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/results/${resultId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Result not found');
        }
        throw new Error('Failed to fetch result');
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error fetching result:', error);
      setError(error instanceof Error ? error.message : 'Failed to load result');
      toast.error('Failed to load result');
    } finally {
      setIsLoading(false);
    }
  };

  const generateChatPrompt = () => {
    if (!result) return '';
    
    return `Based on my previous voice analysis, here are my results:

**Transcript:**
"${result.inputText}"

**AI Analysis:**
${result.analysisText}

I'd like to discuss this analysis further. What insights can you provide?`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your saved analysis...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.href = '/'}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Saved Voice Analysis
            </h1>
            <p className="text-gray-600">
              Analyzed on {new Date(result.createdAt).toLocaleDateString()} at{' '}
              {new Date(result.createdAt).toLocaleTimeString()}
            </p>
          </div>

          {/* Transcript Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Transcript
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 leading-relaxed">
                {result.inputText || 'No transcript available'}
              </p>
            </div>
          </div>

          {/* AI Analysis Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              AI Emotional Insights
            </h3>
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6">
              <div className="prose prose-gray max-w-none">
                {result.analysisText.split('\n').map((paragraph, index) => (
                  paragraph.trim() && (
                    <p key={index} className="text-gray-700 leading-relaxed mb-4 last:mb-0">
                      {paragraph.trim()}
                    </p>
                  )
                ))}
              </div>
            </div>
          </div>

          {/* Chat Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Continue the Conversation
            </h3>
            
            {/* Chat Messages */}
            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSubmit} className="flex space-x-2">
              <input
                value={input}
                onChange={handleInputChange}
                placeholder={
                  messages.length === 0
                    ? generateChatPrompt()
                    : "Ask about your emotional analysis..."
                }
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isChatLoading}
              />
              <button
                type="submit"
                disabled={isChatLoading || !input.trim()}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isChatLoading ? 'Sending...' : 'Send'}
              </button>
            </form>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => window.location.href = '/'}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Analyze Another Recording
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
