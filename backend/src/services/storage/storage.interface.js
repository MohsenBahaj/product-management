/**
 * Storage Service Interface
 *
 * All storage implementations must expose these two methods.
 * Controllers call storageService.uploadFile / storageService.deleteFile exclusively —
 * they never touch the underlying provider directly.
 *
 * uploadFile(file, folder) → Promise<string>
 *   file   — Multer file object produced by memoryStorage
 *             (must have .buffer Buffer, .originalname string, .mimetype string)
 *   folder — Logical path prefix inside the bucket (e.g. 'products/thumbnails', 'profiles')
 *   returns  Public URL of the uploaded file, stored as-is in PostgreSQL
 *
 * deleteFile(fileUrl) → Promise<void>
 *   fileUrl — The URL previously returned by uploadFile
 *             Implementations must treat null / undefined / unrecognised URLs as a no-op
 *             so callers can call best-effort deletes without extra guards
 */
