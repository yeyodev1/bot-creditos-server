import express from 'express';

import { upload } from '../middleware/multer.middleware';
import { uploadImage } from '../controllers/uploadImage.controller';

const router = express.Router();

router.post('/upload', upload.single('file'), uploadImage);

export default router;