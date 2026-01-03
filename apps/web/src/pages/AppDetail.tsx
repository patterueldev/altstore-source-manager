import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

interface App {
  _id: string;
  name: string;
  bundleIdentifier: string;
  developerName: string;
  subtitle?: string;
  iconURL?: string;
}

interface Version {
  _id: string;
  version: string;
  date: string;
  localizedDescription?: string;
  downloadURL: string;
  size: number;
  minOSVersion: string;
}

export default function AppDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState<App | null>(null);
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);

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
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{app.name}</h1>
              <p className="text-sm text-gray-500">{app.bundleIdentifier}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                <div>
                  <h3 className="font-semibold text-lg">{version.version}</h3>
                  <p className="text-sm text-gray-500">{new Date(version.date).toLocaleDateString()}</p>
                  {version.localizedDescription && (
                    <p className="text-sm text-gray-600 mt-2">{version.localizedDescription}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {(version.size / 1024 / 1024).toFixed(2)} MB • iOS {version.minOSVersion}+
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteVersion(version._id)}
                  className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                >
                  Delete
                </button>
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
