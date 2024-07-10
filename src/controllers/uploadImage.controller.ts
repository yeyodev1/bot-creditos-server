import path from 'node:path';
import { Request, Response } from 'express';
import { Storage } from '@google-cloud/storage';

import handleHttpError from '../utils/handleError';
import GoogleCloudStorageUploader from '../services/GcpUploadService';

const bucketName = 'botcreditos-bucket-images';
const keyFilenamePath = path.join(process.cwd(), '/gcpFilename.json');
const storage = new Storage({ keyFilename: keyFilenamePath });
const uploader = new GoogleCloudStorageUploader(storage, bucketName);

export async function uploadImage(req: Request, res: Response) {
  try {
    if (!req.file) {
      return handleHttpError(res, 'No file uploaded', 400);
    }

    const imageUrl = await uploader.uploadFile(req.file);

    res.status(200).send({ url: imageUrl });
  } catch (error) {
    handleHttpError(res, 'cannot upload image');
  }
}