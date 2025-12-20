// Initialize MongoDB collections and indexes for AltStore Source Manager

db = db.getSiblingDB('altstore');

// Create users collection
db.createCollection('users');
db.users.createIndex({ email: 1 }, { unique: true });

// Create apps collection
db.createCollection('apps');
db.apps.createIndex({ bundleIdentifier: 1 }, { unique: true });
db.apps.createIndex({ createdAt: 1 });
db.apps.createIndex({ updatedAt: 1 });

// Create versions collection
db.createCollection('versions');
db.versions.createIndex({ appId: 1, version: 1 }, { unique: true });
db.versions.createIndex({ appId: 1, date: -1 });

// Create sessions collection (optional, for session management)
db.createCollection('sessions');
db.sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
db.sessions.createIndex({ userId: 1 });

print('MongoDB collections and indexes initialized successfully');
