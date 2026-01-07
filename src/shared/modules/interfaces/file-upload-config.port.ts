import type { Options } from 'multer';

export interface FileUploadConfigPort {
  getMulterOptions(): Options;
}
