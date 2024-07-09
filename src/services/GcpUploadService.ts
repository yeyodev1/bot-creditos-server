import { Storage } from '@google-cloud/storage';

class GoogleCloudStorageUploader {
  private storage: Storage;
  private bucketName: string;

  constructor(storage: Storage, bucketName: string) {
    this.storage = storage;
    this.bucketName = bucketName;
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const bucket = this.storage.bucket(this.bucketName);
      const blob = bucket.file(file.originalname);
      const blobStream = blob.createWriteStream({
        resumable: false,
      });

      blobStream.on('error', (err) => {
        console.error('Error in blobStream:', err);
        reject(`Unable to upload file, something went wrong: ${err}`);
      });

      blobStream.on('finish', async () => {
        try {
          await blob.makePublic();
          const publicUrl = `https://storage.googleapis.com/${this.bucketName}/${blob.name}`;
          resolve(publicUrl);
        } catch (err) {
          console.error('Error making file public:', err);
          reject(`Unable to make file public: ${err}`);
        }
      });

      try {
        blobStream.end(file.buffer);
      } catch (err) {
        console.error('Error while writing file to blobStream:', err);
        reject(`Unable to write file to blobStream: ${err}`);
      }
    });
  }
}

export default GoogleCloudStorageUploader;