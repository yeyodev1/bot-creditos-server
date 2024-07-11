import axios from 'axios';
import path from 'node:path';
import crypto from 'node:crypto';
import { Storage } from '@google-cloud/storage';

import { UploadFileData } from '../interfaces/ctx.interface';

class GoogleCloudStorageUploader {
  private storage: Storage;
  private bucketName: string;

  constructor(storage: Storage, bucketName: string) {
    this.storage = storage;
    this.bucketName = bucketName;
  }

  private generateUniqueFileName(extension: string): string {
    const hash = crypto.randomBytes(16).toString('hex');
    return `${hash}${extension}`;
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

  async uploadFileFromUrl(data: UploadFileData): Promise<string> {
    try {
      const response = await axios.get(data.urlTempFile, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data, 'binary');

      const fileExtension = path.extname(data.urlTempFile);
      const fileName = this.generateUniqueFileName(fileExtension);

      const bucket = this.storage.bucket(this.bucketName);
      const blob = bucket.file(fileName);
      const blobStream = blob.createWriteStream({
        resumable: false,
        metadata: {
          contentType: response.headers['content-type'],
          metadata: {
            name: data.name,
            from: data.from,
            host: data.host
          }
        }
      });

      return new Promise((resolve, reject) => {
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

        blobStream.end(buffer);
      });
    } catch (error) {
      console.error('Error downloading or uploading file:', error);
      throw new Error(`Unable to download or upload file: ${error}`);
    }
  }
}

export default GoogleCloudStorageUploader;