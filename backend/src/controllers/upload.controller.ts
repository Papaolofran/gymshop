import type { Request, Response } from 'express';
import multer from 'multer';
import { supabaseAdmin } from '../config/database.js';

const BUCKET_NAME = 'product-images';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Configurar multer para almacenar en memoria (buffer)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}. Solo se permiten JPEG, PNG y WebP.`));
    }
  },
}).single('image');

// POST /api/upload/product-image
export const uploadProductImage = (req: Request, res: Response) => {
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: `El archivo excede el tamaño máximo de ${MAX_FILE_SIZE / 1024 / 1024}MB`,
        });
      }
      return res.status(400).json({ success: false, message: err.message });
    }

    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No se envió ningún archivo' });
    }

    try {
      // Generar nombre único para el archivo
      const ext = req.file.originalname.split('.').pop() || 'jpg';
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const fileName = `${timestamp}-${randomSuffix}.${ext}`;

      // Subir a Supabase Storage
      const { error: uploadError } = await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('Error al subir imagen a Supabase:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Error al subir la imagen',
        });
      }

      // Obtener URL pública
      const { data: publicUrlData } = supabaseAdmin.storage
        .from(BUCKET_NAME)
        .getPublicUrl(fileName);

      return res.status(201).json({
        success: true,
        message: 'Imagen subida correctamente',
        data: {
          url: publicUrlData.publicUrl,
          fileName,
        },
      });
    } catch (error) {
      console.error('Error inesperado al subir imagen:', error);
      return res.status(500).json({
        success: false,
        message: 'Error inesperado al subir la imagen',
      });
    }
  });
};

// DELETE /api/upload/product-image
export const deleteProductImage = async (req: Request, res: Response) => {
  const { fileName } = req.body;

  if (!fileName) {
    return res.status(400).json({
      success: false,
      message: 'Se requiere el nombre del archivo a eliminar',
    });
  }

  try {
    const { error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .remove([fileName]);

    if (error) {
      console.error('Error al eliminar imagen:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al eliminar la imagen',
      });
    }

    return res.json({
      success: true,
      message: 'Imagen eliminada correctamente',
    });
  } catch (error) {
    console.error('Error inesperado al eliminar imagen:', error);
    return res.status(500).json({
      success: false,
      message: 'Error inesperado al eliminar la imagen',
    });
  }
};
