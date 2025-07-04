'use client';

import { useEffect, useState } from 'react';
import { useSupabase } from '@/components/SupabaseProvider';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface AccessCode {
  id: string;
  code: string;
  max_uses: number;
  current_uses: number;
  expires_at: string | null;
  created_at: string;
}

export default function AccountPage() {
  const { user, supabase, loading } = useSupabase();
  const [accessCodes, setAccessCodes] = useState<AccessCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirectTo=/account');
      return;
    }

    if (user) {
      fetchAccessCodes();
    }
  }, [user, loading, router]);

  const fetchAccessCodes = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('access_codes')
        .select('*')
        .eq('created_by_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setAccessCodes(data || []);
    } catch (error) {
      console.error('Error fetching access codes:', error);
      setError('Failed to load your access codes');
    } finally {
      setIsLoading(false);
    }
  };

  const createAccessCode = async () => {
    if (accessCodes.length >= 20) {
      toast.error('You can only have up to 20 active access codes');
      return;
    }

    try {
      setIsCreating(true);
      
      const response = await fetch('/api/access-codes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({
          maxUses: 1,
          expiresAt: null, // No expiration by default
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create access code');
      }

      const result = await response.json();
      toast.success('Access code created successfully!');
      
      // Refresh the list
      await fetchAccessCodes();
    } catch (error) {
      console.error('Error creating access code:', error);
      toast.error('Failed to create access code');
    } finally {
      setIsCreating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getShareUrl = (code: string) => {
    return `${window.location.origin}/?accessCode=${code}`;
  };

  if (loading || isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
        <p className="mt-2 text-gray-600">
          Manage your profile and access codes
        </p>
      </div>

      {/* Profile Section */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="mt-1 text-sm text-gray-900">{user.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Member Since</label>
            <p className="mt-1 text-sm text-gray-900">
              {formatDate(user.created_at || new Date().toISOString())}
            </p>
          </div>
        </div>
      </div>

      {/* Access Codes Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Access Codes</h2>
            <p className="mt-1 text-sm text-gray-600">
              Create and manage access codes to share with others ({accessCodes.length}/20)
            </p>
          </div>
          <button
            onClick={createAccessCode}
            disabled={isCreating || accessCodes.length >= 20}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isCreating ? 'Creating...' : 'Create New Code'}
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        {accessCodes.length === 0 ? (
          <div className="text-center py-8">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m0 0a2 2 0 012 2m-2-2a2 2 0 00-2-2m2 2V9a2 2 0 00-2-2m2 2a2 2 0 002 2M9 7a2 2 0 00-2 2m0 0a2 2 0 00-2 2m2-2a2 2 0 012-2m-2 2V9a2 2 0 012-2m-2 2a2 2 0 00-2 2" />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No access codes</h3>
            <p className="mt-1 text-sm text-gray-500">
              Create your first access code to share with others.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {accessCodes.map((code) => (
              <div key={code.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <code className="bg-gray-100 px-3 py-1 rounded text-sm font-mono">
                        {code.code}
                      </code>
                      <span className="text-sm text-gray-500">
                        Used {code.current_uses}/{code.max_uses} times
                      </span>
                      {code.expires_at && (
                        <span className="text-sm text-gray-500">
                          Expires: {formatDate(code.expires_at)}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                      Created: {formatDate(code.created_at)}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => copyToClipboard(code.code)}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Copy Code
                    </button>
                    <button
                      onClick={() => copyToClipboard(getShareUrl(code.code))}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Copy Link
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
