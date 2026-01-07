import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { memoryStorage, diskStorage } from 'multer';
import { FileModuleOptions } from '../../interfaces/file-upload-module-options.interface';

export class MulterOptionsFactory {
  static create(options: FileModuleOptions): MulterOptions {
    return {
      storage:
        options.storage === 'disk'
          ? diskStorage({})
          : memoryStorage(),

      limits: {
        fileSize: options.maxFileSizeKb * 1024,
      },

      fileFilter: (_req, file, cb) => {
        if (!options.allowedTypes || options.allowedTypes.includes('any')) {
          return cb(null, true);
        }

        if (
          options.allowedTypes.includes('image') &&
          file.mimetype.startsWith('image/')
        ) {
          return cb(null, true);
        }

        if (
          options.allowedTypes.includes('pdf') &&
          file.mimetype === 'application/pdf'
        ) {
          return cb(null, true);
        }

        cb(new Error('Tipo de archivo no permitido'), false);
      },
    };
  }
}