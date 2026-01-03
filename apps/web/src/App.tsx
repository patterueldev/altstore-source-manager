export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <h1 className="text-3xl font-bold text-gray-900">AltStore Source Manager</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-12 px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Welcome</h2>
          <p className="text-gray-600 mb-4">
            This is the AltStore Source Manager dashboard. Manage your apps, versions, and generate AltStore source JSON.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h3 className="font-semibold text-blue-900">Apps</h3>
              <p className="text-sm text-blue-700">Manage your app list</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <h3 className="font-semibold text-green-900">Versions</h3>
              <p className="text-sm text-green-700">Track app versions and builds</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <h3 className="font-semibold text-purple-900">Source JSON</h3>
              <p className="text-sm text-purple-700">Preview and export source</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
