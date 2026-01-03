import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SketchPicker } from 'react-color';
import { api } from '../lib/api';

interface SourceConfig {
  name: string;
  subtitle: string;
  description: string;
  iconURL: string;
  headerURL: string;
  website: string;
  tintColor: string;
  featuredApps: string[];
}

interface App {
  _id: string;
  name: string;
  bundleIdentifier: string;
}

export default function Settings() {
  const [config, setConfig] = useState<SourceConfig>({
    name: '',
    subtitle: '',
    description: '',
    iconURL: '',
    headerURL: '',
    website: '',
    tintColor: '',
    featuredApps: [],
  });
  const [apps, setApps] = useState<App[]>([]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadConfig();
    loadApps();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await api.get('/source-config');
      setConfig({
        name: response.data.name || '',
        subtitle: response.data.subtitle || '',
        description: response.data.description || '',
        iconURL: response.data.iconURL || '',
        headerURL: response.data.headerURL || '',
        website: response.data.website || '',
        tintColor: response.data.tintColor || '',
        featuredApps: response.data.featuredApps || [],
      });
    } catch (err: any) {
      console.error('Failed to load config:', err);
    }
  };

  const loadApps = async () => {
    try {
      const response = await api.get('/apps');
      setApps(response.data);
    } catch (err: any) {
      console.error('Failed to load apps:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!config.name.trim()) {
      setError('Source name is required');
      return;
    }

    setLoading(true);
    try {
      await api.put('/source-config', config);
      setSuccess('Source settings updated successfully');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  const handleFeaturedAppsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions, option => option.value);
    setConfig({ ...config, featuredApps: selected });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center">
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-900 mr-4"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Source Settings</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-6">
            Configure your AltStore source metadata. These settings control how your source appears in AltStore.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Source Name *
              </label>
              <input
                type="text"
                value={config.name}
                onChange={(e) => setConfig({ ...config, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="My AltStore Source"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subtitle
              </label>
              <input
                type="text"
                value={config.subtitle}
                onChange={(e) => setConfig({ ...config, subtitle: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="All my apps in one place"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={config.description}
                onChange={(e) => setConfig({ ...config, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Welcome to my source! Here you'll find all of my apps."
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Icon URL
              </label>
              <input
                type="url"
                value={config.iconURL}
                onChange={(e) => setConfig({ ...config, iconURL: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="https://example.com/source-icon.png"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Header URL
              </label>
              <input
                type="url"
                value={config.headerURL}
                onChange={(e) => setConfig({ ...config, headerURL: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="https://example.com/source-header.png"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <input
                type="url"
                value={config.website}
                onChange={(e) => setConfig({ ...config, website: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="https://example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tint Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={config.tintColor}
                  onChange={(e) => setConfig({ ...config, tintColor: e.target.value })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="#4185A9"
                />
                <button
                  type="button"
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
                >
                  Pick Color
                </button>
              </div>
              {showColorPicker && (
                <div className="mt-2 p-3 bg-white border border-gray-200 rounded-lg">
                  <SketchPicker
                    color={config.tintColor}
                    onChange={(color: any) => setConfig({ ...config, tintColor: color.hex })}
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Featured Apps
              </label>
              {apps.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No apps available. Create some apps first.</p>
              ) : (
                <select
                  multiple
                  value={config.featuredApps}
                  onChange={handleFeaturedAppsChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  size={Math.min(apps.length, 5)}
                >
                  {apps.map(app => (
                    <option key={app._id} value={app.bundleIdentifier}>
                      {app.name} ({app.bundleIdentifier})
                    </option>
                  ))}
                </select>
              )}
              <p className="mt-1 text-xs text-gray-500">Hold Ctrl/Cmd to select multiple apps</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
