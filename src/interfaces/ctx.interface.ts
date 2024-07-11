export interface Ctx {
  key: {
    remoteJid: string;
    fromMe: boolean;
    id: string;
  };
  messageTimestamp: number;
  pushName: string;
  broadcast: boolean;
  message: {
    imageMessage: {
      url: string;
      mimetype: string;
      fileSha256: string;
      fileLength: string;
      height: number;
      width: number;
      mediaKey: string;
      fileEncSha256: string;
      directPath: string;
      mediaKeyTimestamp: string;
      jpegThumbnail: string;
      firstScanSidecar: string;
      firstScanLength: number;
      scansSidecar: string;
      scanLengths: string[];
      midQualityFileSha256: string;
    };
    messageContextInfo: {
      deviceListMetadata: Record<string, unknown>;
      deviceListMetadataVersion: number;
    };
  };
  body: string;
  name: string;
  from: string;
  host: string;
  urlTempFile: string;
}

export interface UploadFileData {
  urlTempFile: string;
  name: string;
  from: string;
  host: string;
}