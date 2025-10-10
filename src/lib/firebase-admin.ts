import admin from 'firebase-admin';
import type { ServiceAccount } from 'firebase-admin';
import { randomUUID } from 'crypto';

function getAdminApp(): admin.app.App {
  // Check if the app is already initialized to prevent errors
  if (admin.apps.length > 0 && admin.apps[0]) {
    return admin.apps[0];
  }

  const serviceAccount = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  } as ServiceAccount;

  if (!serviceAccount.clientEmail || !serviceAccount.privateKey) {
    throw new Error(
      'Firebase Admin credentials not found in environment variables. Please set FIREBASE_ADMIN_CLIENT_EMAIL and FIREBASE_ADMIN_PRIVATE_KEY.'
    );
  }

  // Initialize the app
  return admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.appspot.com`,
  });
}

export function getAdminAuth() {
  return getAdminApp().auth();
}

export function getAdminDb() {
  return getAdminApp().firestore();
}

export function getAdminStorage() {
  return getAdminApp().storage();
}

/**
 * Uploads a buffer to Firebase Storage and returns its public URL.
 * @param buffer The buffer of the file to upload.
 * @param destinationPath The path in the bucket where the file will be stored.
 * @param contentType The MIME type of the file.
 * @param bucketName Optional. The name of the bucket. If not provided, uses default bucket.
 * @returns The public URL of the uploaded file.
 */
export async function uploadBufferToStorage(
  buffer: Buffer, 
  destinationPath: string, 
  contentType: string,
  bucketName?: string
): Promise<string> {
  try {
    // Use provided bucket name or get default bucket
    const bucket = bucketName 
      ? getAdminStorage().bucket(bucketName)
      : getAdminStorage().bucket();
    
    const file = bucket.file(destinationPath);

    // Create a unique token for the public URL
    const uuid = randomUUID();

    await file.save(buffer, {
      metadata: {
        contentType,
        metadata: {
          // Add a unique token for cache-busting and public access
          firebaseStorageDownloadTokens: uuid,
        },
      },
    });

    // Make the file public (this is one way, another is to generate signed URLs)
    // For simplicity, we'll construct the public URL directly with the token.
    const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(destinationPath)}?alt=media&token=${uuid}`;

    console.log(`✅ File uploaded successfully to: ${publicUrl}`);
    return publicUrl;
  } catch (error) {
    console.error('❌ Error uploading to Firebase Storage:', error);
    throw new Error(`Failed to upload file to Firebase Storage: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
