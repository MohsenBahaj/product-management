const admin = require('firebase-admin');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const config = require('../../config');

let _bucket = null;
// Strip gs:// prefix if present — needed for public URL construction,
// while initializeApp accepts either form.
const BUCKET_NAME = (config.firebase.storageBucket || '').replace(/^gs:\/\//, '').trim();

const getBucket = () => {
  if (_bucket) return _bucket;

  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: (config.firebase.projectId || '').trim(),
        clientEmail: (config.firebase.clientEmail || '').trim(),
        // dotenv stores literal \n — restore actual newlines
        privateKey: (config.firebase.privateKey || '').replace(/\\n/g, '\n').trim(),
      }),
      storageBucket: BUCKET_NAME,
    });
  }

  _bucket = admin.storage().bucket();
  return _bucket;
};

/**
 * Upload a Multer memoryStorage file to Firebase Storage.
 * Returns the permanent public URL.
 */
const uploadFile = async (file, folder) => {
  const ext = path.extname(file.originalname).toLowerCase() || '.bin';
  const storagePath = `${folder}/${uuidv4()}${ext}`;

  const bucket = getBucket();
  const fileRef = bucket.file(storagePath);

  await fileRef.save(file.buffer, {
    metadata: { contentType: file.mimetype },
  });

  await fileRef.makePublic();

  return `https://storage.googleapis.com/${BUCKET_NAME}/${storagePath}`;
};

/**
 * Delete a file from Firebase Storage by its public URL.
 * Silently no-ops for null, undefined, or URLs not belonging to this bucket.
 */
const deleteFile = async (fileUrl) => {
  if (!fileUrl) return;

  const bucketPrefix = `https://storage.googleapis.com/${BUCKET_NAME}/`;
  if (!fileUrl.startsWith(bucketPrefix)) return;

  const storagePath = fileUrl.slice(bucketPrefix.length);
  const bucket = getBucket();

  await bucket.file(storagePath).delete();
};

module.exports = { uploadFile, deleteFile };
