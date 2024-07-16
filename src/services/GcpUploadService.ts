import crypto from 'crypto';
import mime from 'mime-types';
import { Readable } from 'stream';
import { Storage } from '@google-cloud/storage';
import { downloadContentFromMessage } from '@whiskeysockets/baileys';

import { UploadImageData } from '../interfaces/ctx.interface';

class GoogleCloudStorageUploader {
  private storage: Storage;
  private bucketName: string;

  constructor(storage: Storage, bucketName: string) {
    this.storage = storage;
    this.bucketName = bucketName;
  }

  private async streamToBuffer(stream: Readable): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
  }

  async uploadImageFromMessage(message: UploadImageData) {
    try {
      const { imageMessage } = message;

      if (!imageMessage) {
        throw new Error('Image message not found');
      }

      // Descargar el contenido de la imagen
      const stream = await downloadContentFromMessage(imageMessage, 'image');
      const buffer = await this.streamToBuffer(stream);

      // Detectar el tipo de archivo usando mime-types
      const mimeType = imageMessage.mimetype;
      const contentType = mimeType || 'application/octet-stream';
      let fileExtension = mime.extension(contentType);

      if (!fileExtension) {
        fileExtension = '.jpg';
      } else {
        fileExtension = `.${fileExtension}`;
      }

      const fileName = `${crypto.randomUUID()}${fileExtension}`;

      const bucket = this.storage.bucket(this.bucketName);
      const file = bucket.file(fileName);

      // Guardar el archivo con metadatos adecuados
      await file.save(buffer, {
        metadata: {
          contentType: contentType,
          metadata: {
            originalFilename: imageMessage.filename || 'unknown', // Usa el nombre original si está disponible
            fileSize: imageMessage.fileLength || buffer.length,
            width: imageMessage.width,
            height: imageMessage.height,
          },
        },
      });

      await file.makePublic();

      const publicUrl = `https://storage.googleapis.com/${this.bucketName}/${fileName}`;

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
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