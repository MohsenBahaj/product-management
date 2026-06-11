/**
 * Firebase Storage connection test
 *
 * Loads credentials → initializes Admin SDK → uploads a 1×1 PNG →
 * makes it public → prints the URL → deletes it.
 *
 * Run from the backend/ directory:
 *   node scripts/test-firebase.js
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ── Env loading ───────────────────────────────────────────────────────────────
// Try .env first (production/standard), fall back to .env.example (dev shortcut)
const envCandidates = [
  path.resolve(__dirname, '../.env'),
  path.resolve(__dirname, '../.env.example'),
];

const envFile = envCandidates.find((f) => fs.existsSync(f));
if (!envFile) {
  console.error('✗ No .env or .env.example found in backend/');
  process.exit(1);
}
require('dotenv').config({ path: envFile });
console.log(`\n  Loaded env from: ${path.basename(envFile)}`);

// ── Parse + normalise ─────────────────────────────────────────────────────────
const rawBucket  = (process.env.FIREBASE_STORAGE_BUCKET || '').trim();
const bucketName = rawBucket.replace(/^gs:\/\//, '');   // strip gs:// if present
const projectId  = (process.env.FIREBASE_PROJECT_ID    || '').trim();
const clientEmail= (process.env.FIREBASE_CLIENT_EMAIL  || '').trim();
const privateKey = (process.env.FIREBASE_PRIVATE_KEY   || '')
  .replace(/\\n/g, '\n')  // restore actual newlines from dotenv
  .trim();

// ── Config summary ────────────────────────────────────────────────────────────
console.log('\n── Parsed config ────────────────────────────────────────────────');
console.log(`  project_id:       ${projectId    || '(missing)'}`);
console.log(`  client_email:     ${clientEmail  || '(missing)'}`);
console.log(`  private_key:      ${privateKey   ? `${privateKey.slice(0, 27)}…` : '(missing)'}`);
console.log(`  storage_bucket:   ${bucketName   || '(missing)'}${rawBucket !== bucketName ? '  ← gs:// stripped' : ''}`);

if (rawBucket !== bucketName) {
  console.log('\n  ⚠  FIREBASE_STORAGE_BUCKET contained a gs:// prefix.');
  console.log('     The service strips it automatically — no action needed.');
}

const missing = [];
if (!projectId)   missing.push('FIREBASE_PROJECT_ID');
if (!clientEmail) missing.push('FIREBASE_CLIENT_EMAIL');
if (!privateKey)  missing.push('FIREBASE_PRIVATE_KEY');
if (!bucketName)  missing.push('FIREBASE_STORAGE_BUCKET');

if (missing.length > 0) {
  console.error(`\n✗ Missing env variables: ${missing.join(', ')}`);
  process.exit(1);
}

// ── Firebase init ─────────────────────────────────────────────────────────────
const admin = require('firebase-admin');

try {
  admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
    storageBucket: bucketName,
  });
} catch (err) {
  console.error(`\n✗ Firebase initializeApp failed: ${err.message}`);
  process.exit(1);
}
console.log('\n✓ Firebase Admin SDK initialized');

// ── Test file ─────────────────────────────────────────────────────────────────
// Minimal valid 1×1 transparent PNG (68 bytes)
const TEST_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAA' +
  'YAAjCB0C8AAAAASUVORK5CYII=',
  'base64'
);

const STORAGE_PATH = `test/connection-check-${Date.now()}.png`;

const run = async () => {
  const bucket  = admin.storage().bucket();
  const fileRef = bucket.file(STORAGE_PATH);

  // 1 — Upload ────────────────────────────────────────────────────────────────
  process.stdout.write('  Uploading test file … ');
  try {
    await fileRef.save(TEST_PNG, { metadata: { contentType: 'image/png' } });
    console.log('✓');
  } catch (err) {
    console.log('✗');
    console.error(`\n✗ Upload failed: ${err.message}`);
    if (err.message.includes('Permission')) {
      console.error(
        '\n  Hint: check that the service account has the "Storage Object Admin" role\n' +
        '  in IAM → Service accounts, or set permissive Storage rules temporarily.'
      );
    }
    process.exit(1);
  }

  // 2 — Make public + build URL ───────────────────────────────────────────────
  process.stdout.write('  Making file public  … ');
  try {
    await fileRef.makePublic();
    console.log('✓');
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${STORAGE_PATH}`;
    console.log(`\n  Public URL: ${publicUrl}`);
  } catch (err) {
    console.log('✗');
    console.error(`\n  makePublic() failed: ${err.message}`);
    console.error(
      '  Hint: add `allow read: if true;` to Firebase Storage rules,\n' +
      '  or grant "Storage Object Viewer" to allUsers in the bucket IAM.'
    );
    // Non-fatal — continue to cleanup
  }

  // 3 — Cleanup ───────────────────────────────────────────────────────────────
  process.stdout.write('\n  Deleting test file  … ');
  try {
    await fileRef.delete();
    console.log('✓');
  } catch (err) {
    console.log('✗');
    console.error(`  Delete failed: ${err.message}`);
  }

  console.log('\n✓ Firebase Storage is connected and working.\n');
};

run().catch((err) => {
  console.error(`\n✗ Unexpected error: ${err.message}`);
  process.exit(1);
});
