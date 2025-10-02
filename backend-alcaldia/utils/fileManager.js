import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads_excel');
const METADATA_FILE = path.join(UPLOADS_DIR, 'files-metadata.json');

class FileManager {
  constructor() {
    this.ensureUploadsDir();
    this.loadMetadata();
  }

  ensureUploadsDir() {
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
  }

  loadMetadata() {
    try {
      if (fs.existsSync(METADATA_FILE)) {
        const data = fs.readFileSync(METADATA_FILE, 'utf8');
        this.metadata = JSON.parse(data);
      } else {
        this.metadata = { files: [] };
        this.saveMetadata();
      }
    } catch (error) {
      console.error('Error loading metadata:', error);
      this.metadata = { files: [] };
    }
  }

  saveMetadata() {
    try {
      fs.writeFileSync(METADATA_FILE, JSON.stringify(this.metadata, null, 2));
    } catch (error) {
      console.error('Error saving metadata:', error);
    }
  }

  addFile(fileInfo) {
    const fileData = {
      id: Date.now().toString(),
      filename: fileInfo.filename,
      originalName: fileInfo.originalname,
      path: fileInfo.path,
      size: fileInfo.size,
      mtime: new Date().toISOString()
    };

    this.metadata.files.push(fileData);
    this.saveMetadata();
    return fileData;
  }

  getAllFiles() {
    return this.metadata.files || [];
  }

  getFileById(id) {
    return this.metadata.files.find(file => file.id === id);
  }

  removeFile(id) {
    const fileIndex = this.metadata.files.findIndex(file => file.id === id);
    if (fileIndex !== -1) {
      const file = this.metadata.files[fileIndex];
      
      // Remove physical file
      try {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      } catch (error) {
        console.error('Error removing physical file:', error);
      }

      // Remove from metadata
      this.metadata.files.splice(fileIndex, 1);
      this.saveMetadata();
      return true;
    }
    return false;
  }

  getFileStats() {
    const files = this.getAllFiles();
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    
    return {
      totalFiles: files.length,
      totalSize: totalSize,
      totalSizeMB: (totalSize / 1024 / 1024).toFixed(2)
    };
  }
}

export default new FileManager();
