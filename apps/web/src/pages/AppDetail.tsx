import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

interface App {
  _id: string;
  name: string;
  bundleIdentifier: string;
  marketplaceID?: string;
  developerName: string;
  subtitle?: string;
  localizedDescription?: string;
  iconURL?: string;
  tintColor?: string;
  category?: string;
  screenshots?: string[];
}

interface Version {
  _id: string;
  version: string;
  buildVersion?: string;
  date: string;
  localizedDescription?: string;
  downloadURL: string;
  size: number;
  minOSVersion: string;
  maxOSVersion?: string;
}

export default function AppDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState<App | null>(null);
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditAppModal, setShowEditAppModal] = useState(false);
  const [editingVersion, setEditingVersion] = useState<Version | null>(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [appRes, versionsRes] = await Promise.all([
        api.get(`/apps/${id}`),
        api.get(`/versions/app/${id}`),
      ]);
      setApp(appRes.data);
      setVersions(versionsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVersion = async (versionId: string) => {
    if (!confirm('Delete this version?')) return;
    try {
      await api.delete(`/versions/${versionId}`);
      fetchData();
    } catch (error) {
      alert('Failed to delete version');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!app) {
    return <div className="flex items-center justify-center min-h-screen">App not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center">
          <button onClick={() => navigate('/')} className="text-gray-600 hover:text-gray-900 mr-4">
            ← Back
          </button>
          <div className="flex items-center gap-4 flex-1">
            {app.iconURL && <img src={app.iconURL} alt={app.name} className="w-12 h-12 rounded-lg" />}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{app.name}</h1>
              <p className="text-sm text-gray-500">{app.bundleIdentifier}</p>
            </div>
            <button
              onClick={() => setShowEditAppModal(true)}
              className="px-3 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
            >
              Edit App
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* App Details Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">App Details</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Developer:</span>
              <span className="ml-2 font-medium">{app.developerName}</span>
            </div>
            {app.category && (
              <div>
                <span className="text-gray-500">Category:</span>
                <span className="ml-2 font-medium">{app.category}</span>
              </div>
            )}
            {app.marketplaceID && (
              <div>
                <span className="text-gray-500">Marketplace ID:</span>
                <span className="ml-2 font-medium">{app.marketplaceID}</span>
              </div>
            )}
            {app.tintColor && (
              <div className="flex items-center">
                <span className="text-gray-500">Tint Color:</span>
                <span className="ml-2 font-medium">{app.tintColor}</span>
                <div className="ml-2 w-6 h-6 rounded" style={{ backgroundColor: app.tintColor }}></div>
              </div>
            )}
          </div>
          {app.localizedDescription && (
            <div className="mt-4">
              <span className="text-gray-500">Description:</span>
              <p className="mt-1 text-gray-700">{app.localizedDescription}</p>
            </div>
          )}
          {app.screenshots && app.screenshots.length > 0 && (
            <div className="mt-4">
              <span className="text-gray-500 block mb-2">Screenshots:</span>
              <div className="flex gap-2 overflow-x-auto">
                {app.screenshots.map((url, index) => (
                  <img key={index} src={url} alt={`Screenshot ${index + 1}`} className="h-40 rounded" />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Versions Section */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Versions</h2>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            + Upload Version
          </button>
        </div>

        {versions.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 mb-4">No versions yet</p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Upload First Version
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow">
            {versions.map((version) => (
              <div key={version._id} className="border-b last:border-b-0 p-4 flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{version.version}</h3>
                    {version.buildVersion && (
                      <span className="text-sm text-gray-500">Build {version.buildVersion}</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{new Date(version.date).toLocaleDateString()}</p>
                  {version.localizedDescription && (
                    <p className="text-sm text-gray-600 mt-2">{version.localizedDescription}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {(version.size / 1024 / 1024).toFixed(2)} MB • iOS {version.minOSVersion}+
                    {version.maxOSVersion && ` - ${version.maxOSVersion}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingVersion(version)}
                    className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteVersion(version._id)}
                    className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showUploadModal && (
        <UploadVersionModal
          appId={id!}
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            setShowUploadModal(false);
            fetchData();
          }}
        />
      )}

      {showEditAppModal && app && (
        <EditAppModal
          app={app}
          onClose={() => setShowEditAppModal(false)}
          onSuccess={() => {
            setShowEditAppModal(false);
            fetchData();
          }}
        />
      )}

      {editingVersion && (
        <EditVersionModal
          version={editingVersion}
          onClose={() => setEditingVersion(null)}
          onSuccess={() => {
            setEditingVersion(null);
            fetchData();
          }}
        />
      )}
    </div>
  );
}

interface EditAppModalProps {
  app: App;
  onClose: () => void;
  onSuccess: () => void;
}

function EditAppModal({ app, onClose, onSuccess }: EditAppModalProps) {
  const [formData, setFormData] = useState({
    name: app.name,
    bundleIdentifier: app.bundleIdentifier,
    marketplaceID: app.marketplaceID || '',
    developerName: app.developerName,
    subtitle: app.subtitle || '',
    localizedDescription: app.localizedDescription || '',
    iconURL: app.iconURL || '',
    tintColor: app.tintColor || '',
    category: app.category || '',
  });
  const [screenshots, setScreenshots] = useState<string[]>(app.screenshots || []);
  const [screenshotInput, setScreenshotInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.put(`/apps/${app._id}`, { ...formData, screenshots });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update app');
    } finally {
      setLoading(false);
    }
  };

  const addScreenshot = () => {
    if (screenshotInput.trim()) {
      setScreenshots([...screenshots, screenshotInput.trim()]);
      setScreenshotInput('');
    }
  };

  const removeScreenshot = (index: number) => {
    setScreenshots(screenshots.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 my-8">
        <h3 className="text-xl font-semibold mb-4">Edit App</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">App Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bundle Identifier *</label>
              <input
                type="text"
                value={formData.bundleIdentifier}
                onChange={(e) => setFormData({ ...formData, bundleIdentifier: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Developer Name *</label>
              <input
                type="text"
                value={formData.developerName}
                onChange={(e) => setFormData({ ...formData, developerName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Marketplace ID</label>
              <input
                type="text"
                value={formData.marketplaceID}
                onChange={(e) => setFormData({ ...formData, marketplaceID: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
            <input
              type="text"
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.localizedDescription}
              onChange={(e) => setFormData({ ...formData, localizedDescription: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Select category</option>
                <option value="utilities">Utilities</option>
                <option value="games">Games</option>
                <option value="entertainment">Entertainment</option>
                <option value="lifestyle">Lifestyle</option>
                <option value="productivity">Productivity</option>
                <option value="developer-tools">Developer Tools</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tint Color</label>
              <input
                type="text"
                value={formData.tintColor}
                onChange={(e) => setFormData({ ...formData, tintColor: e.target.value })}
                placeholder="#F54F32"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Icon URL</label>
            <input
              type="url"
              value={formData.iconURL}
              onChange={(e) => setFormData({ ...formData, iconURL: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Screenshots</label>
            <div className="flex gap-2 mb-2">
              <input
                type="url"
                value={screenshotInput}
                onChange={(e) => setScreenshotInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addScreenshot())}
                placeholder="https://example.com/screenshot.png"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
              />
              <button
                type="button"
                onClick={addScreenshot}
                className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Add
              </button>
            </div>
            {screenshots.length > 0 && (
              <div className="space-y-1">
                {screenshots.map((url, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <span className="flex-1 truncate text-gray-600">{url}</span>
                    <button
                      type="button"
                      onClick={() => removeScreenshot(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
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
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface EditVersionModalProps {
  version: Version;
  onClose: () => void;
  onSuccess: () => void;
}

function EditVersionModal({ version, onClose, onSuccess }: EditVersionModalProps) {
  const [formData, setFormData] = useState({
    version: version.version,
    buildVersion: version.buildVersion || '',
    date: version.date.split('T')[0],
    localizedDescription: version.localizedDescription || '',
    minOSVersion: version.minOSVersion,
    maxOSVersion: version.maxOSVersion || '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.put(`/versions/${version._id}`, formData);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update version');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 className="text-xl font-semibold mb-4">Edit Version</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Version *</label>
              <input
                type="text"
                value={formData.version}
                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Build Version</label>
              <input
                type="text"
                value={formData.buildVersion}
                onChange={(e) => setFormData({ ...formData, buildVersion: e.target.value })}
                placeholder="60"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Release Date *</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min iOS *</label>
              <input
                type="text"
                value={formData.minOSVersion}
                onChange={(e) => setFormData({ ...formData, minOSVersion: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max iOS</label>
              <input
                type="text"
                value={formData.maxOSVersion}
                onChange={(e) => setFormData({ ...formData, maxOSVersion: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Release Notes</label>
            <textarea
              value={formData.localizedDescription}
              onChange={(e) => setFormData({ ...formData, localizedDescription: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
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
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface UploadVersionModalProps {
  appId: string;
  onClose: () => void;
  onSuccess: () => void;
}

function UploadVersionModal({ appId, onClose, onSuccess }: UploadVersionModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    version: '',
    buildVersion: '',
    date: new Date().toISOString().split('T')[0],
    localizedDescription: '',
    minOSVersion: '15.0',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select an IPA file');
      return;
    }

    const data = new FormData();
    data.append('ipa', file);
    data.append('appId', appId);
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value);
    });

    setLoading(true);
    try {
      await api.post('/versions', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to upload version');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 className="text-xl font-semibold mb-4">Upload New Version</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">IPA File *</label>
            <input
              type="file"
              accept=".ipa"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Version *</label>
              <input
                type="text"
                value={formData.version}
                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                placeholder="1.0.0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Build Version</label>
              <input
                type="text"
                value={formData.buildVersion}
                onChange={(e) => setFormData({ ...formData, buildVersion: e.target.value })}
                placeholder="60"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Release Date *</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min iOS Version *</label>
            <input
              type="text"
              value={formData.minOSVersion}
              onChange={(e) => setFormData({ ...formData, minOSVersion: e.target.value })}
              placeholder="15.0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Release Notes</label>
            <textarea
              value={formData.localizedDescription}
              onChange={(e) => setFormData({ ...formData, localizedDescription: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
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
              {loading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
