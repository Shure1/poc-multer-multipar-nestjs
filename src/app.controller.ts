import { Controller, Get, Inject, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';
import { FILE_UPLOAD_CONFIG_SERVICE } from './shared/modules/constants/file-upload.constants';
import type { FileUploadConfigPort } from './shared/modules/interfaces/file-upload-config.port';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';

@Controller('images')
export class AppController {
  constructor(
    private readonly appService: AppService,
  ) {}


}
