// Google Drive folder configuration
// Add your Google Drive folder IDs here for each category
export const DRIVE_FOLDERS = {
  'dugunden-once': '147X9FoyAczw0zvSe2vS7SuZLhr7VLate', // Düğünden Önce photos
  'kina-gecesi': '', // Add Kına Gecesi folder ID here
  'dugun': '', // Add Düğün folder ID here
} as const;

export interface DriveFile {
  id: string;
  name: string;
  thumbnailUrl: string;
  viewUrl: string;
  downloadUrl: string;
}

// Generate Google Drive URLs for a file
export function getDriveUrls(fileId: string) {
  return {
    // Thumbnail URLs at different sizes
    thumbnail: {
      small: `https://drive.google.com/thumbnail?id=${fileId}&sz=w200`,
      medium: `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`,
      large: `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`,
    },
    // Direct view/download URLs
    view: `https://drive.google.com/file/d/${fileId}/view`,
    download: `https://drive.google.com/uc?export=download&id=${fileId}`,
    // Embed URL for displaying
    embed: `https://drive.google.com/uc?export=view&id=${fileId}`,
  };
}

// Parse the embedded folder view HTML to extract file information
export function parseEmbeddedFolderHtml(html: string): DriveFile[] {
  const files: DriveFile[] = [];
  
  // Extract file entries using regex
  const entryRegex = /id="entry-([a-zA-Z0-9_-]+)"[\s\S]*?flip-entry-title">([^<]+)</g;
  let match;
  
  while ((match = entryRegex.exec(html)) !== null) {
    const fileId = match[1];
    const fileName = match[2];
    const urls = getDriveUrls(fileId);
    
    files.push({
      id: fileId,
      name: fileName,
      thumbnailUrl: urls.thumbnail.medium,
      viewUrl: urls.view,
      downloadUrl: urls.download,
    });
  }
  
  return files;
}

// Fetch files from a Google Drive folder (client-side)
export async function fetchDriveFolderFiles(folderId: string): Promise<DriveFile[]> {
  if (!folderId) return [];
  
  try {
    // Use a CORS proxy or the embedded folder view
    const response = await fetch(
      `https://drive.google.com/embeddedfolderview?id=${folderId}`,
      {
        headers: {
          'Accept': 'text/html',
        },
      }
    );
    
    if (!response.ok) {
      console.error('Failed to fetch folder:', response.status);
      return [];
    }
    
    const html = await response.text();
    return parseEmbeddedFolderHtml(html);
  } catch (error) {
    console.error('Error fetching Drive folder:', error);
    return [];
  }
}

// Get the folder URL for embedding or linking
export function getDriveFolderUrl(folderId: string) {
  return `https://drive.google.com/drive/folders/${folderId}`;
}
