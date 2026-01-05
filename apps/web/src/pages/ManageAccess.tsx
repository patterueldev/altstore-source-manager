import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

interface AccessKey {
  id: string;
  key: string;
  name: string;
  createdAt: string;
  lastUsedAt?: string;
  active: boolean;
}

interface CreateKeyResponse {
  id: string;
  key: string;
  secret: string;
  name: string;
  createdAt: string;
}

export default function ManageAccess() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [keys, setKeys] = useState<AccessKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [creating, setCreating] = useState(false);
  const [createdKey, setCreatedKey] = useState<CreateKeyResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/access-keys');
      setKeys(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch access keys');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!keyName.trim()) {
      setError('Key name is required');
      return;
    }

    try {
      setCreating(true);
      setError(null);
      const response = await api.post('/access-keys', {
        name: keyName,
      });

      setCreatedKey(response.data);
      setKeyName('');
      setShowCreateDialog(false);
      await fetchKeys();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create access key');
    } finally {
      setCreating(false);
    }
  };

  const handleRevokeKey = async (id: string) => {
    if (!window.confirm('Are you sure you want to revoke this access key? CI/CD pipelines using this key will stop working.')) {
      return;
    }

    try {
      setError(null);
      await api.delete(`/access-keys/${id}`);
      await fetchKeys();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to revoke access key');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (user?.username !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-red-800 font-semibold">Access Denied</h2>
            <p className="text-red-700 mt-2">Only administrators can manage access keys.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                aria-label="Back to dashboard"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Manage Access Keys</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Hi, {user?.username}</span>
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                  aria-label="Menu"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                {showMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-20 border border-gray-200">
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          navigate('/');
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Dashboard
                      </button>
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          navigate('/profile');
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Profile
                      </button>
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          navigate('/settings');
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Settings
                      </button>
                      <div className="border-t border-gray-200 my-1" />
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          logout();
                          navigate('/login');
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Description */}
        <div className="mb-8">
          <p className="text-gray-600">
            Create and manage API access keys for CI/CD pipelines. Each key pair (key + secret) enables secure IPA uploads without sharing admin credentials.
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Create Key Section */}
        <div className="mb-8">
          <button
            onClick={() => setShowCreateDialog(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <span className="mr-2">+</span> Create New Access Key
          </button>
        </div>

        {/* Create Dialog */}
        {showCreateDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Access Key</h2>

              <form onSubmit={handleCreateKey}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Key Name
                  </label>
                  <input
                    type="text"
                    value={keyName}
                    onChange={(e) => setKeyName(e.target.value)}
                    placeholder="e.g., GitHub Actions, Jenkins CI"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={creating}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Give this key a descriptive name to identify where it&apos;s used.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateDialog(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    disabled={creating}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    disabled={creating}
                  >
                    {creating ? 'Creating...' : 'Create Key'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Created Key Display */}
        {createdKey && (
          <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-green-900">Access Key Created Successfully</h3>
                <p className="text-green-700 text-sm mt-1">
                  Save your secret now. You won&apos;t be able to see it again.
                </p>
              </div>
              <button
                onClick={() => setCreatedKey(null)}
                className="text-green-600 hover:text-green-800 font-bold text-xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 mb-4 bg-white rounded p-4 border border-green-200">
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                  Access Key
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-gray-100 p-3 rounded font-mono text-sm text-gray-900 break-all">
                    {createdKey.key}
                  </code>
                  <button
                    onClick={() => copyToClipboard(createdKey.key)}
                    className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded font-medium text-sm transition-colors"
                  >
                    {copied && createdKey.key === createdKey.key ? '✓' : 'Copy'}
                  </button>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                  Secret
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-gray-100 p-3 rounded font-mono text-sm text-gray-900 break-all">
                    {createdKey.secret}
                  </code>
                  <button
                    onClick={() => copyToClipboard(createdKey.secret)}
                    className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded font-medium text-sm transition-colors"
                  >
                    {copied && createdKey.secret === createdKey.secret ? '✓' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>

            <p className="text-xs text-green-700 bg-green-100 p-3 rounded">
              Use both the key and secret together in the format <code className="font-mono">key:secret</code> in the <code className="font-mono">X-Access-Key</code> header when uploading IPAs.
            </p>
          </div>
        )}

        {/* Keys List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading access keys...</div>
          ) : keys.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No access keys yet. Create one to get started with CI/CD integration.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {keys.map((key) => (
                <div key={key.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{key.name}</h3>
                        {!key.active && (
                          <span className="inline-block px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
                            Revoked
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>
                          <span className="font-medium">Key:</span>{' '}
                          <code className="bg-gray-100 px-2 py-1 rounded font-mono text-xs">
                            {key.key}
                          </code>
                        </p>
                        <p>
                          <span className="font-medium">Created:</span> {formatDate(key.createdAt)}
                        </p>
                        {key.lastUsedAt && (
                          <p>
                            <span className="font-medium">Last used:</span> {formatDate(key.lastUsedAt)}
                          </p>
                        )}
                      </div>
                    </div>
                    {key.active && (
                      <button
                        onClick={() => handleRevokeKey(key.id)}
                        className="ml-4 px-3 py-2 text-red-600 hover:bg-red-50 font-medium text-sm rounded transition-colors"
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Usage Example */}
        <div className="mt-8 bg-gray-900 text-gray-100 rounded-lg p-6 font-mono text-sm overflow-x-auto">
          <p className="text-gray-400 mb-3">Example: Upload IPA using curl</p>
          <pre className="whitespace-pre-wrap">
{`curl -X POST https://your-domain/api/versions/ci-upload \\
  -H "X-Access-Key: ak_xxx:xxx...xxx" \\
  -F "ipa=@MyApp.ipa" \\
  -F "appId=<app-id>" \\
  -F "version=1.0.0" \\
  -F "buildVersion=1" \\
  -F "date=2025-01-05" \\
  -F "minOSVersion=14.0" \\
  -F "localizedDescription=Release notes here"`}
          </pre>
        </div>
      </div>
    </div>
  );
}
