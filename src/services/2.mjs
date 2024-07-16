import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import { Storage } from '@google-cloud/storage';
import crypto from 'crypto';
import path from 'path';
import { fileTypeFromBuffer } from 'file-type';

// Configura tu Google Cloud Storage
const keyFilenamePath = path.join(process.cwd(), '/gcpFilename.json');
const storage = new Storage({ keyFilename: keyFilenamePath });
const bucketName = 'botcreditos-bucket-images';

async function uploadImageFromMessage(ctx) {
  try {
    const { message } = ctx;
    const { imageMessage } = message;

    if (!imageMessage) {
      throw new Error('No se encontró un imageMessage en el contexto');
    }

    // Descargar el contenido de la imagen
    const stream = await downloadContentFromMessage(imageMessage, 'image');
    const buffer = await streamToBuffer(stream);

    // Detectar el tipo de archivo
    const fileType = await fileTypeFromBuffer(buffer);
    console.log('Tipo de archivo detectado:', fileType);

    const contentType = fileType ? fileType.mime : imageMessage.mimetype;
    const fileExtension = fileType ? `.${fileType.ext}` : '.jpg';

    // Generar un nombre único para el archivo
    const fileName = `${crypto.randomUUID()}${fileExtension}`;

    // Subir a Google Cloud Storage
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(fileName);

    await file.save(buffer, {
      metadata: {
        contentType: contentType,
        metadata: {
          originalFilename: imageMessage.fileName || 'unknown',
          fileSize: imageMessage.fileLength,
          width: imageMessage.width,
          height: imageMessage.height,
        }
      }
    });

    await file.makePublic();

    const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;

    return publicUrl;
  } catch (error) {
    console.error('Error al procesar y subir la imagen:', error);
    throw error;
  }
}

// Función auxiliar para convertir un stream a buffer
function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

const imageUrl = await uploadImageFromMessage({
  "key": {
    "remoteJid": "593995715540@s.whatsapp.net",
    "fromMe": false,
    "id": "C5D473522BFC79C46C"
  },
  "messageTimestamp": 1721089843,
  "pushName": "Jorge D",
  "broadcast": false,
  "message": {
    "imageMessage": {
      "url": "https://mmg.whatsapp.net/o1/v/t62.7118-24/f1/m238/up-oil-image-7fc685a5-b2eb-41dc-b47d-10ebf3f11738?ccb=9-4&oh=01_Q5AaIKEsqxgwG-dkpfkd5d0UtZM68X7AQfnZwEamTlnHNTye&oe=66BD2E60&_nc_sid=000000&mms3=true",
      "mimetype": "image/jpeg",
      "fileSha256": "uODFv83Mac06UqoTGZaEIEG1NBJjh1PvARlDswsJobg=",
      "fileLength": "32479",
      "height": 306,
      "width": 360,
      "mediaKey": "pl2wEPqSp+CGoqqd5zUuIh+kwwnxXyPCf89fij/Ckl0=",
      "fileEncSha256": "5KJ/hTvpOFq8qyluiG5N0uUMoS7Vs221z7Pvl7L8cfs=",
      "directPath": "/o1/v/t62.7118-24/f1/m238/up-oil-image-7fc685a5-b2eb-41dc-b47d-10ebf3f11738?ccb=9-4&oh=01_Q5AaIKEsqxgwG-dkpfkd5d0UtZM68X7AQfnZwEamTlnHNTye&oe=66BD2E60&_nc_sid=000000",
      "mediaKeyTimestamp": "1721089336",
      "jpegThumbnail": "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",
      "contextInfo": "asda"
    },
    "messageContextInfo": "asda"
  },
  "body": "event_media_1d05e8c6-9b57-4b6b-8eb5-3994cbd0a30c",
  "name": "Jorge D",
  "from": "593995715540",
  "host": "593992909432"
});

console.log('Imagen subida:', imageUrl);