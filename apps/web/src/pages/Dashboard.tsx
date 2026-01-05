import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SketchPicker } from 'react-color';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

interface App {
  _id: string;
  name: string;
  bundleIdentifier: string;
  developerName: string;
  subtitle?: string;
  iconURL?: string;
  visible?: boolean;
}

export default function Dashboard() {
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [sourceUrl, setSourceUrl] = useState<string>('');
  const [copyFeedback, setCopyFeedback] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Source is at root path / - use API URL domain
    const API_URL = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
    setSourceUrl(API_URL);
    fetchApps();
  }, []);

  const fetchApps = async () => {
    try {
      const response = await api.get('/apps');
      setApps(response.data);
    } catch (error) {
      console.error('Failed to fetch apps:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopySourceUrl = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(sourceUrl);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = sourceUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopyFeedback('Copied!');
      setTimeout(() => setCopyFeedback(''), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      setCopyFeedback('Failed');
      setTimeout(() => setCopyFeedback(''), 2000);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900">AltStore Manager</h1>
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
                      {user?.username === 'admin' && (
                        <button
                          onClick={() => {
                            setShowMenu(false);
                            navigate('/manage-access');
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Manage Access
                        </button>
                      )}
                      <div className="border-t border-gray-200 my-1" />
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          handleLogout();
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
          <div className="mt-4 flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <p className="text-xs text-gray-600 mb-1">Source.json URL:</p>
              <code className="text-sm text-gray-800">{sourceUrl}</code>
            </div>
            <button
              onClick={handleCopySourceUrl}
              className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 whitespace-nowrap"
            >
              {copyFeedback || 'Copy'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Apps</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            + New App
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
          </div>
        ) : apps.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 mb-4">No apps yet. Create your first app to get started!</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              + Create First App
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {apps.map((app) => (
              <div
                key={app._id}
                onClick={() => navigate(`/apps/${app._id}`)}
                className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-4">
                  {app.iconURL ? (
                    <img src={app.iconURL} alt={app.name} className="w-16 h-16 rounded-lg" />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-purple-100 flex items-center justify-center">
                      <span className="text-2xl font-bold text-purple-600">
                        {app.name[0]}
                      </span>
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{app.name}</h3>
                    <p className="text-sm text-gray-500">{app.bundleIdentifier}</p>
                    {app.subtitle && (
                      <p className="text-sm text-gray-600 mt-1">{app.subtitle}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create App Modal */}
      {showCreateModal && (
        <CreateAppModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchApps();
          }}
        />
      )}
    </div>
  );
}

interface CreateAppModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

function CreateAppModal({ onClose, onSuccess }: CreateAppModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    bundleIdentifier: '',
    developerName: '',
    subtitle: '',
    localizedDescription: '',
    tintColor: '#F54F32',
    visible: true,
  });
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!iconFile) {
        setError('Icon is required');
        setLoading(false);
        return;
      }

      if (!formData.localizedDescription.trim()) {
        setError('Description is required');
        setLoading(false);
        return;
      }

      // Create app first
      const appResponse = await api.post('/apps', { 
        ...formData,
        iconURL: 'https://placeholder.com/icon.png', // Temporary placeholder
      });
      
      const appId = appResponse.data._id;

      // Upload icon
      const formDataWithFile = new FormData();
      formDataWithFile.append('icon', iconFile);
      await api.post(`/apps/${appId}/icon`, formDataWithFile, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create app');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-semibold mb-4">Create New App</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              App Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bundle Identifier *
            </label>
            <input
              type="text"
              value={formData.bundleIdentifier}
              onChange={(e) => setFormData({ ...formData, bundleIdentifier: e.target.value })}
              placeholder="com.example.app"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Developer Name *
            </label>
            <input
              type="text"
              value={formData.developerName}
              onChange={(e) => setFormData({ ...formData, developerName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subtitle
            </label>
            <input
              type="text"
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              value={formData.localizedDescription}
              onChange={(e) => setFormData({ ...formData, localizedDescription: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tint Color *
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="w-12 h-10 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-purple-500"
                style={{ backgroundColor: formData.tintColor }}
              />
              <input
                type="text"
                value={formData.tintColor}
                onChange={(e) => setFormData({ ...formData, tintColor: e.target.value })}
                placeholder="#F54F32"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              />
            </div>
            {showColorPicker && (
              <div className="mt-2 p-3 bg-white border border-gray-200 rounded-lg">
                <SketchPicker
                  color={formData.tintColor}
                  onChange={(color: any) => setFormData({ ...formData, tintColor: color.hex })}
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              App Icon (PNG) *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              {iconFile ? (
                <div>
                  <p className="text-sm text-green-600 mb-2">✓ {iconFile.name}</p>
                  <button
                    type="button"
                    onClick={() => setIconFile(null)}
                    className="text-sm text-purple-600 hover:text-purple-700"
                  >
                    Choose Different
                  </button>
                </div>
              ) : (
                <input
                  type="file"
                  accept="image/png"
                  onChange={(e) => setIconFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="icon-input"
                  required
                />
              )}
              <label htmlFor="icon-input" className="cursor-pointer">
                {!iconFile && (
                  <p className="text-sm text-gray-600">
                    <span className="text-purple-600 font-medium">Click to upload</span> or drag and drop
                  </p>
                )}
              </label>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="visible"
              checked={formData.visible}
              onChange={(e) => setFormData({ ...formData, visible: e.target.checked })}
              className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
            />
            <label htmlFor="visible" className="text-sm font-medium text-gray-700">
              Visible in source
            </label>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
