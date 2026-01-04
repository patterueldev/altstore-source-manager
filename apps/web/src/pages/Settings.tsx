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
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [headerFile, setHeaderFile] = useState<File | null>(null);
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
      // Upload icon if changed
      if (iconFile) {
        console.log('Uploading source icon:', iconFile.name);
        const iconFormData = new FormData();
        iconFormData.append('icon', iconFile);
        const iconResponse = await api.post('/source-config/icon', iconFormData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        config.iconURL = iconResponse.data.iconURL;
        console.log('Icon uploaded:', iconResponse.data.iconURL);
      }

      // Upload header if changed
      if (headerFile) {
        console.log('Uploading source header:', headerFile.name);
        const headerFormData = new FormData();
        headerFormData.append('header', headerFile);
        const headerResponse = await api.post('/source-config/header', headerFormData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        config.headerURL = headerResponse.data.headerURL;
        console.log('Header uploaded:', headerResponse.data.headerURL);
      }

      // Update config with potentially new image URLs
      await api.put('/source-config', config);
      
      // Clear file states after successful upload
      setIconFile(null);
      setHeaderFile(null);
      
      // Reload config to get updated URLs
      await loadConfig();
      
      setSuccess('Source settings updated successfully');
    } catch (err: any) {
      console.error('Update error:', err);
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
                Source Icon (PNG/JPEG)
              </label>
              {config.iconURL && !iconFile ? (
                <div className="space-y-2">
                  <img 
                    src={config.iconURL} 
                    alt="Source Icon" 
                    className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => document.getElementById('icon-upload')?.click()}
                    className="text-sm text-purple-600 hover:text-purple-700"
                  >
                    Change Icon
                  </button>
                </div>
              ) : iconFile ? (
                <div className="space-y-2">
                  <p className="text-sm text-green-600">✓ {iconFile.name}</p>
                  <button
                    type="button"
                    onClick={() => setIconFile(null)}
                    className="text-sm text-purple-600 hover:text-purple-700"
                  >
                    Choose Different
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <label htmlFor="icon-upload" className="cursor-pointer">
                    <p className="text-sm text-gray-600">
                      <span className="text-purple-600 font-medium">Click to upload</span> icon
                    </p>
                  </label>
                </div>
              )}
              <input
                type="file"
                id="icon-upload"
                accept="image/png,image/jpeg"
                onChange={(e) => setIconFile(e.target.files?.[0] || null)}
                className="hidden"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Header Image (PNG/JPEG)
              </label>
              {config.headerURL && !headerFile ? (
                <div className="space-y-2">
                  <img 
                    src={config.headerURL} 
                    alt="Source Header" 
                    className="w-full max-w-md h-32 object-cover rounded-lg border-2 border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => document.getElementById('header-upload')?.click()}
                    className="text-sm text-purple-600 hover:text-purple-700"
                  >
                    Change Header
                  </button>
                </div>
              ) : headerFile ? (
                <div className="space-y-2">
                  <p className="text-sm text-green-600">✓ {headerFile.name}</p>
                  <button
                    type="button"
                    onClick={() => setHeaderFile(null)}
                    className="text-sm text-purple-600 hover:text-purple-700"
                  >
                    Choose Different
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <label htmlFor="header-upload" className="cursor-pointer">
                    <p className="text-sm text-gray-600">
                      <span className="text-purple-600 font-medium">Click to upload</span> header
                    </p>
                  </label>
                </div>
              )}
              <input
                type="file"
                id="header-upload"
                accept="image/png,image/jpeg"
                onChange={(e) => setHeaderFile(e.target.files?.[0] || null)}
                className="hidden"
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
