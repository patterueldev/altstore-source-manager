import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SketchPicker } from 'react-color';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { api } from '../lib/api';

interface App {
  _id: string;
  name: string;
  bundleIdentifier: string;
  developerName: string;
  subtitle?: string;
  localizedDescription?: string;
  iconURL?: string;
  tintColor?: string;
  screenshots?: string[];
  visible?: boolean;
}

interface Version {
  _id: string;
  version: string;
  buildVersion: string;
  date: string;
  createdAt?: string;
  localizedDescription: string;
  downloadURL: string;
  size: number;
  minOSVersion: string;
  maxOSVersion?: string;
  visible?: boolean;
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
      // Sort versions by createdAt (fallback to date) descending
      const sortedVersions = versionsRes.data.sort((a: Version, b: Version) => {
        const bTime = new Date(b.createdAt || b.date).getTime();
        const aTime = new Date(a.createdAt || a.date).getTime();
        return bTime - aTime;
      });
      setVersions(sortedVersions);
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

// Helper function to generate iOS versions
function generateiOSVersions(): string[] {
  const versions: string[] = [];
  for (let major = 12; major <= 18; major++) {
    for (let minor = 0; minor <= 9; minor++) {
      versions.push(`${major}.${minor}`);
    }
  }
  return versions;
}

const iosVersions = generateiOSVersions();

interface EditAppModalProps {
  app: App;
  onClose: () => void;
  onSuccess: () => void;
}

function EditAppModal({ app, onClose, onSuccess }: EditAppModalProps) {
  const [formData, setFormData] = useState({
    name: app.name,
    bundleIdentifier: app.bundleIdentifier,
    developerName: app.developerName,
    subtitle: app.subtitle || '',
    localizedDescription: app.localizedDescription || '',
    tintColor: app.tintColor || '#F54F32',
    visible: app.visible !== undefined ? app.visible : true,
  });
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [screenshots, setScreenshots] = useState<string[]>(app.screenshots || []);
  const [newScreenshots, setNewScreenshots] = useState<File[]>([]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleAddScreenshots = (files: FileList | null) => {
    if (!files) {
      console.log('No files selected');
      return;
    }
    
    console.log(`Selected ${files.length} files`);
    const totalCount = screenshots.length + newScreenshots.length + files.length;
    
    console.log(`Current screenshots: ${screenshots.length}, new screenshots: ${newScreenshots.length}, adding: ${files.length}, total: ${totalCount}`);
    
    if (totalCount > 6) {
      const errorMsg = `Maximum 6 screenshots allowed. You can add ${6 - (screenshots.length + newScreenshots.length)} more.`;
      console.warn(errorMsg);
      setError(errorMsg);
      return;
    }
    
    setError('');
    const filesArray = Array.from(files);
    filesArray.forEach((file, index) => {
      console.log(`  File ${index + 1}: ${file.name}, ${file.type}, ${file.size} bytes`);
    });
    
    setNewScreenshots([...newScreenshots, ...filesArray]);
    console.log(`New screenshots array updated, now has ${newScreenshots.length + filesArray.length} files`);
  };

  const handleRemoveExistingScreenshot = async (index: number) => {
    try {
      await api.delete(`/apps/${app._id}/screenshots/${index}`);
      setScreenshots(screenshots.filter((_, i) => i !== index));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete screenshot');
    }
  };

  const handleRemoveNewScreenshot = (index: number) => {
    setNewScreenshots(newScreenshots.filter((_, i) => i !== index));
  };

  const handleReorderScreenshots = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(screenshots);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);
    setScreenshots(items);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Starting app update...');
      
      // Update app metadata
      console.log('Updating app metadata:', formData);
      await api.put(`/apps/${app._id}`, formData);
      console.log('App metadata updated');
      
      // Upload icon if changed
      if (iconFile) {
        console.log('Uploading icon:', iconFile.name, iconFile.type, iconFile.size);
        const iconFormData = new FormData();
        iconFormData.append('icon', iconFile);
        await api.post(`/apps/${app._id}/icon`, iconFormData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        console.log('Icon uploaded successfully');
      }

      // Upload new screenshots
      let updatedScreenshots = screenshots;
      if (newScreenshots.length > 0) {
        console.log(`Uploading ${newScreenshots.length} new screenshots`);
        const screenshotFormData = new FormData();
        newScreenshots.forEach((file, index) => {
          screenshotFormData.append('screenshots', file);
          console.log(`  Screenshot ${index + 1}: ${file.name}, ${file.type}, ${file.size} bytes`);
        });
        
        try {
          const response = await api.post(`/apps/${app._id}/screenshots`, screenshotFormData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          console.log('Screenshots uploaded successfully:', response.data);
          
          // Update screenshots state with newly uploaded URLs
          if (response.data.screenshots) {
            updatedScreenshots = response.data.screenshots;
            setScreenshots(updatedScreenshots);
          }
          
          // Clear newScreenshots after successful upload
          setNewScreenshots([]);
        } catch (screenshotError: any) {
          console.error('Screenshot upload failed:', screenshotError);
          throw new Error(`Screenshot upload failed: ${screenshotError.response?.data?.error || screenshotError.message}`);
        }
      }

      // Update screenshot order if there are screenshots and order was changed
      if (updatedScreenshots.length > 0) {
        console.log('Updating screenshot order:', updatedScreenshots);
        await api.put(`/apps/${app._id}/screenshots/reorder`, { screenshots: updatedScreenshots });
        console.log('Screenshot order updated');
      }
      
      console.log('App update complete, showing success message');
      setSuccess(true);
      
      // Show success message for 1.5 seconds before closing
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: any) {
      console.error('App update error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to update app');
    } finally {
      setLoading(false);
    }
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea
              value={formData.localizedDescription}
              onChange={(e) => setFormData({ ...formData, localizedDescription: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tint Color *</label>
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
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">App Icon (PNG)</label>
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
                  id="edit-icon-input"
                />
              )}
              <label htmlFor="edit-icon-input" className="cursor-pointer">
                {!iconFile && (
                  <p className="text-sm text-gray-600">
                    <span className="text-purple-600 font-medium">Click to upload</span> or drag and drop
                  </p>
                )}
              </label>
            </div>
          </div>
          {/* Screenshots Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Screenshots (Max 6, PNG/JPEG)
            </label>
            
            {/* Existing Screenshots with Drag-to-Reorder */}
            {screenshots.length > 0 && (
              <DragDropContext onDragEnd={handleReorderScreenshots}>
                <Droppable droppableId="screenshots" direction="horizontal">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="flex gap-2 mb-3 overflow-x-auto pb-2"
                    >
                      {screenshots.map((url, index) => (
                        <Draggable key={url} draggableId={url} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`relative flex-shrink-0 ${snapshot.isDragging ? 'opacity-50' : ''}`}
                            >
                              <img
                                src={url}
                                alt={`Screenshot ${index + 1}`}
                                className="h-32 w-auto rounded border-2 border-gray-300"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveExistingScreenshot(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                              >
                                ×
                              </button>
                              <div className="text-xs text-center text-gray-500 mt-1">#{index + 1}</div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}

            {/* New Screenshots Preview */}
            {newScreenshots.length > 0 && (
              <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                {newScreenshots.map((file, index) => (
                  <div key={index} className="relative flex-shrink-0">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`New ${index + 1}`}
                      className="h-32 w-auto rounded border-2 border-green-300"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveNewScreenshot(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                    >
                      ×
                    </button>
                    <div className="text-xs text-center text-green-600 mt-1">New</div>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Button */}
            {(screenshots.length + newScreenshots.length) < 6 && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  multiple
                  onChange={(e) => handleAddScreenshots(e.target.files)}
                  className="hidden"
                  id="screenshots-input"
                />
                <label htmlFor="screenshots-input" className="cursor-pointer">
                  <p className="text-sm text-gray-600">
                    <span className="text-purple-600 font-medium">Click to upload</span> screenshots
                    <br />
                    <span className="text-xs text-gray-500">
                      {screenshots.length + newScreenshots.length}/6 used
                    </span>
                  </p>
                </label>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="app-visible"
              checked={formData.visible}
              onChange={(e) => setFormData({ ...formData, visible: e.target.checked })}
              className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
            />
            <label htmlFor="app-visible" className="text-sm font-medium text-gray-700">
              Visible in source
            </label>
          </div>

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg text-sm">
              ✓ App updated successfully!
            </div>
          )}

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
              disabled={loading || success}
              className={`flex-1 px-4 py-2 text-white rounded-lg disabled:opacity-50 ${
                success ? 'bg-green-600' : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              {success ? '✓ Saved!' : loading ? 'Saving...' : 'Save Changes'}
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
              <select
                value={formData.minOSVersion}
                onChange={(e) => setFormData({ ...formData, minOSVersion: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              >
                {iosVersions.map((version) => (
                  <option key={version} value={version}>iOS {version}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max iOS</label>
              <select
                value={formData.maxOSVersion}
                onChange={(e) => setFormData({ ...formData, maxOSVersion: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">No limit</option>
                {iosVersions.map((version) => (
                  <option key={version} value={version}>iOS {version}</option>
                ))}
              </select>
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
    maxOSVersion: '',
    visible: true,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select an IPA file');
      return;
    }

    if (!formData.buildVersion) {
      setError('Build version is required');
      return;
    }

    if (!formData.localizedDescription.trim()) {
      setError('Release notes are required');
      return;
    }

    const data = new FormData();
    data.append('ipa', file);
    data.append('appId', appId);
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, String(value));
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Build Version *</label>
              <input
                type="text"
                value={formData.buildVersion}
                onChange={(e) => setFormData({ ...formData, buildVersion: e.target.value })}
                placeholder="60"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Min iOS Version *</label>
              <select
                value={formData.minOSVersion}
                onChange={(e) => setFormData({ ...formData, minOSVersion: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              >
                {iosVersions.map((version) => (
                  <option key={version} value={version}>iOS {version}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max iOS Version</label>
              <select
                value={formData.maxOSVersion}
                onChange={(e) => setFormData({ ...formData, maxOSVersion: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">No limit</option>
                {iosVersions.map((version) => (
                  <option key={version} value={version}>iOS {version}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Release Notes *</label>
            <textarea
              value={formData.localizedDescription}
              onChange={(e) => setFormData({ ...formData, localizedDescription: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="version-visible"
              checked={formData.visible}
              onChange={(e) => setFormData({ ...formData, visible: e.target.checked })}
              className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
            />
            <label htmlFor="version-visible" className="text-sm font-medium text-gray-700">
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
              {loading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
