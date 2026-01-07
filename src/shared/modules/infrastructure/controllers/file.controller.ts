// file.controller.ts
import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Inject,
  Get,
  Logger,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FILE_MODULE_OPTIONS } from '../../constants/file-upload.constants';
import type { FileModuleOptions } from '../../interfaces/file-upload-module-options.interface';
import type { Request } from 'express';

@Controller('files')
export class FileController {
  private readonly logger = new Logger(FileController.name);

  constructor(
    @Inject(FILE_MODULE_OPTIONS)
    private readonly options: FileModuleOptions,
  ) {
    this.logger.log('FileController initialized with config:', this.options);
  }

  /**
   * PoC básica: subir archivo
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File, @Req() req: Request) {
    if (!file) {
      this.logger.warn('❌ No file received');
      return { error: true, message: 'No file provided' };
    }

    // Log limpio: solo lo esencial para verificar multipart y memoria
    const isMultipart = req.headers['content-type']?.includes('multipart/form-data');
    
    this.logger.log('📦 Imagen recibida:', {
      nombre: file.originalname,
      tamaño: `${Math.round(file.size / 1024)} KB`,
      tipo: file.mimetype,
      multipart: isMultipart ? '✅' : '❌',
      enMemoria: file.buffer ? `✅ Buffer ${file.buffer.length} bytes` : '❌',
      primerosBytes: file.buffer?.slice(0, 16).toString('hex'),
    });

    return {
      message: 'Archivo recibido correctamente',
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      storage: 'memory (RAM)',
    };
  }

  /**
   * Endpoint de inspección (útil para PoC)
   */
  @Get('config')
  getConfig() {
    return {
      maxFileSizeKb: this.options.maxFileSizeKb,
      allowedTypes: this.options.allowedTypes,
      storage: this.options.storage,
    };
  }
}
