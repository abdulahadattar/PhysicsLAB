import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid'; // For unique filenames

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const storage = admin.storage().bucket(); // Get default bucket reference

/**
 * Adds or updates study material content for a specific chapter.
 * Expects `chapterId` and other study material content fields in `data`.
 */
export const addOrUpdateStudyMaterialContent = functions.https.onCall(async (data, context) => {
  functions.logger.info('addOrUpdateStudyMaterialContent function called', { data, auth: context.auth });

  if (!(context.auth && context.auth.token && context.auth.token.role === 'teacher')) {
    throw new functions.https.HttpsError('permission-denied', 'Only teachers can manage study materials.');
  }

  const { chapterId, ...studyMaterialContent } = data;
  if (!chapterId || typeof chapterId !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'A valid Chapter ID (string) is required.');
  }

  // Basic validation for some expected fields (can be expanded)
  if (studyMaterialContent.keyPoints && !Array.isArray(studyMaterialContent.keyPoints)) {
    throw new functions.https.HttpsError('invalid-argument', 'keyPoints must be an array.');
  }
  if (studyMaterialContent.summary && typeof studyMaterialContent.summary !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'summary must be a string.');
  }

  const studyMaterialRef = db.collection('studyMaterials').doc(chapterId);

  try {
    await studyMaterialRef.set(studyMaterialContent, { merge: true });
    functions.logger.info(`Study material for chapter ${chapterId} added/updated successfully.`);
    return { status: 'success', message: `Study material for chapter ${chapterId} added/updated successfully.` };
  } catch (error: any) {
    functions.logger.error('Error adding/updating study material content:', error);
    throw new functions.https.HttpsError('internal', 'Unable to add/update study material content.', error.message);
  }
});

/**
 * Updates metadata for a specific chapter (e.g., name, order).
 * Expects `chapterId` and fields to update in `data`.
 */
export const updateChapterMetadata = functions.https.onCall(async (data, context) => {
  functions.logger.info('updateChapterMetadata function called', { data, auth: context.auth });

  if (!(context.auth && context.auth.token && context.auth.token.role === 'teacher')) {
    throw new functions.https.HttpsError('permission-denied', 'Only teachers can manage chapter metadata.');
  }

  const { chapterId, ...updatedFields } = data;
  if (!chapterId || typeof chapterId !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'A valid Chapter ID (string) is required for updating metadata.');
  }

  if (Object.keys(updatedFields).length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'No fields provided for update.');
  }

  const chapterRef = db.collection('chapters').doc(chapterId);

  try {
    await chapterRef.update(updatedFields);
    functions.logger.info(`Chapter metadata for ${chapterId} updated successfully.`);
    return { status: 'success', message: `Chapter metadata for ${chapterId} updated successfully.` };
  } catch (error: any) {
    functions.logger.error('Error updating chapter metadata:', error);
    if (error.code === 5) { // Firestore 'NOT_FOUND' error code
        throw new functions.https.HttpsError('not-found', `Chapter with ID ${chapterId} not found.`);
    }
    throw new functions.https.HttpsError('internal', 'Unable to update chapter metadata.', error.message);
  }
});

/**
 * Adds a PDF resource. If type is 'uploaded', it handles file upload to Storage.
 * Expects: chapterId, label, type ('uploaded' or 'link').
 * If 'uploaded': fileData (base64 string), fileName, contentType.
 * If 'link': sourceUrlOrPath (the external URL).
 * Optional: icon.
 */
export const addPdfResource = functions.https.onCall(async (data, context) => {
  functions.logger.info('addPdfResource function called', { dataLength: JSON.stringify(data).length, auth: context.auth });

  if (!(context.auth && context.auth.token && context.auth.token.role === 'teacher')) {
    throw new functions.https.HttpsError('permission-denied', 'Only teachers can manage PDF resources.');
  }

  const { chapterId, label, icon, type, fileData, fileName, contentType, sourceUrlOrPath: externalSourceUrl } = data;

  if (!chapterId || typeof chapterId !== 'string' ||
      !label || typeof label !== 'string' ||
      !type || (type !== 'uploaded' && type !== 'link')) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing or invalid required fields: chapterId, label, type.');
  }

  let resourceSourceUrl = '';
  let filePathInBucket = null;

  if (type === 'uploaded') {
    if (!fileData || typeof fileData !== 'string' ||
        !fileName || typeof fileName !== 'string' ||
        !contentType || typeof contentType !== 'string') {
      throw new functions.https.HttpsError('invalid-argument', 'For type "uploaded", fileData (base64), fileName, and contentType are required.');
    }
    const uniqueFileName = `${uuidv4()}-${fileName}`;
    filePathInBucket = `study-materials/${chapterId}/pdfs/${uniqueFileName}`;
    const file = storage.file(filePathInBucket);

    try {
      const buffer = Buffer.from(fileData, 'base64');
      await file.save(buffer, {
        metadata: { contentType },
        // public: true, // Or set appropriate ACLs if needed
      });
      // Make the file publicly readable to get a simple download URL (adjust permissions as needed)
      // This is often simpler than signed URLs for general access, but consider security implications.
      // For more robust security, use getSignedUrl for temporary access.
      // For simplicity here, we'll assume files are publicly readable or you have a rule for that.
      // resourceSourceUrl = `https://storage.googleapis.com/${storage.name}/${filePathInBucket}`;
      // More robust way to get a download URL if using default bucket and public access is set or via Firebase rules:
      // This requires the object to be public or rules allowing read.
      // A common pattern is to construct the URL if it's public:
      resourceSourceUrl = file.publicUrl(); // This is the simplest if file is public
      functions.logger.info(`File uploaded to ${filePathInBucket}, URL: ${resourceSourceUrl}`);

    } catch (uploadError: any) {
      functions.logger.error('Error uploading file to Firebase Storage:', uploadError);
      throw new functions.https.HttpsError('internal', 'File upload failed.', uploadError.message);
    }
  } else if (type === 'link') {
    if (!externalSourceUrl || typeof externalSourceUrl !== 'string') {
      throw new functions.https.HttpsError('invalid-argument', 'For type "link", sourceUrlOrPath (external URL) is required.');
    }
    resourceSourceUrl = externalSourceUrl;
  }

  const newResource = {
    chapterId,
    label,
    icon: icon || (type === 'uploaded' ? 'file-pdf' : 'link-2'), // Default icon
    type,
    sourceUrlOrPath: resourceSourceUrl,
    filePathInBucket: type === 'uploaded' ? filePathInBucket : null, // Store direct path for uploaded files
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  try {
    const docRef = await db.collection('pdfResources').add(newResource);
    functions.logger.info(`PDF resource added successfully with ID: ${docRef.id}`);
    return { status: 'success', message: 'PDF resource added successfully.', resourceId: docRef.id, sourceUrlOrPath: resourceSourceUrl };
  } catch (error: any) {
    functions.logger.error('Error adding PDF resource to Firestore:', error);
    // If Firestore fails after upload, attempt to delete the uploaded file to prevent orphans
    if (type === 'uploaded' && filePathInBucket) {
        try {
            await storage.file(filePathInBucket).delete();
            functions.logger.warn(`Orphaned file ${filePathInBucket} deleted after Firestore error.`);
        } catch (cleanupError) {
            functions.logger.error(`Failed to cleanup orphaned file ${filePathInBucket}:`, cleanupError);
        }
    }
    throw new functions.https.HttpsError('internal', 'Unable to add PDF resource to Firestore.', error.message);
  }
});

/**
 * Updates an existing PDF resource.
 * Expects `resourceId` and fields to update in `data`.
 * Does not handle file re-uploads; for that, delete and add new.
 */
export const updatePdfResource = functions.https.onCall(async (data, context) => {
  functions.logger.info('updatePdfResource function called', { data, auth: context.auth });

  if (!(context.auth && context.auth.token && context.auth.token.role === 'teacher')) {
    throw new functions.https.HttpsError('permission-denied', 'Only teachers can manage PDF resources.');
  }

  const { resourceId, ...updatedFields } = data;
  if (!resourceId || typeof resourceId !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'A valid Resource ID (string) is required for updating.');
  }

  if (Object.keys(updatedFields).length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'No fields provided for update.');
  }

  // Prevent changing critical fields like type, chapterId, or filePathInBucket directly via update
  // These should be managed by deleting and re-adding if such a change is needed.
  delete updatedFields.type;
  delete updatedFields.chapterId;
  delete updatedFields.filePathInBucket;
  delete updatedFields.sourceUrlOrPath; // If it's an uploaded file, URL is derived. If link, can be updated.
                                         // To simplify, we'll prevent direct update of URL. If it needs to change, re-add.

  if (Object.keys(updatedFields).length === 0) {
 throw new functions.https.HttpsError('invalid-argument', 'No updatable fields provided or trying to update protected fields.');
  }

  const resourceRef = db.collection('pdfResources').doc(resourceId);
  updatedFields.updatedAt = admin.firestore.FieldValue.serverTimestamp();


  try {
    await resourceRef.update(updatedFields);
    functions.logger.info(`PDF resource ${resourceId} updated successfully.`);
    return { status: 'success', message: `PDF resource ${resourceId} updated successfully.` };
  } catch (error: any) {
    functions.logger.error('Error updating PDF resource:', error);
    if (error.code === 5) { // Firestore 'NOT_FOUND' error code
        throw new functions.https.HttpsError('not-found', `PDF Resource with ID ${resourceId} not found.`);
    }
    throw new functions.https.HttpsError('internal', 'Unable to update PDF resource.', error.message);
  }
});

/**
 * Deletes a PDF resource from Firestore and its associated file from Storage if applicable.
 * Expects `resourceId` in `data`.
 */
export const deletePdfResource = functions.https.onCall(async (data, context) => {
  functions.logger.info('deletePdfResource function called', { data, auth: context.auth });

  if (!(context.auth && context.auth.token && context.auth.token.role === 'teacher')) {
    throw new functions.https.HttpsError('permission-denied', 'Only teachers can manage PDF resources.');
  }

  const { resourceId } = data;
  if (!resourceId || typeof resourceId !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'A valid Resource ID (string) is required for deleting.');
  }

  const resourceRef = db.collection('pdfResources').doc(resourceId);

  try {
    const doc = await resourceRef.get();
    if (!doc.exists) {
      throw new functions.https.HttpsError('not-found', `PDF Resource with ID ${resourceId} not found.`);
    }
    const resourceData = doc.data();

    // If it was an uploaded file and we have a direct path, attempt to delete it from Storage
    if (resourceData?.type === 'uploaded' && resourceData?.filePathInBucket) {
      const filePath = resourceData.filePathInBucket;
      try {
        functions.logger.info(`Attempting to delete Storage file: ${filePath}`);
        await storage.file(filePath).delete();
        functions.logger.info(`Storage file deleted: ${filePath}`);
      } catch (storageError: any) {
        // Log storage deletion error but don't block Firestore deletion
        functions.logger.warn(`Failed to delete file "${filePath}" from Storage:`, storageError.message);
      }
    } else if (resourceData?.type === 'uploaded' && resourceData?.sourceUrlOrPath) {
        // Fallback: try to delete from URL if direct path wasn't stored (less robust)
        try {
            const url = new URL(resourceData.sourceUrlOrPath);
            if (url.hostname === 'storage.googleapis.com' || url.hostname.endsWith('.appspot.com')) {
                const pathParts = url.pathname.split('/');
                const filePathToDelete = pathParts.slice(pathParts.indexOf(storage.name) + 1).join('/'); // Assumes bucket name is in path
                if (filePathToDelete) {
                    functions.logger.info(`Attempting to delete Storage file by URL parsing: ${filePathToDelete}`);
                    await storage.file(decodeURIComponent(filePathToDelete)).delete();
                    functions.logger.info(`Storage file deleted by URL parsing: ${filePathToDelete}`);
                }
            }
        } catch (storageUrlError: any) {
            functions.logger.warn('Failed to delete file from Storage using URL parsing:', storageUrlError.message);
        }
    }


    await resourceRef.delete();
    functions.logger.info(`PDF resource ${resourceId} and associated file (if any) deleted successfully.`);
    return { status: 'success', message: `PDF resource ${resourceId} deleted successfully.` };
  } catch (error: any)
 { if (error instanceof functions.https.HttpsError) { // Re-throw HttpsError
        throw error;
    }
    functions.logger.error('Error deleting PDF resource:', error);
    throw new functions.https.HttpsError('internal', 'Unable to delete PDF resource.', error.message);
  }
});