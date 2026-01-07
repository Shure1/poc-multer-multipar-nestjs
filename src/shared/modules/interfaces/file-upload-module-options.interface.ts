// interfaces/file-module-options.interface.ts
import { ModuleMetadata } from '@nestjs/common';

export type FileStorageType = 'memory' | 'disk';

export interface FileModuleOptions {
  maxFileSizeKb: number;
  allowedTypes?: Array<'image' | 'pdf' | 'any'>;
  storage?: FileStorageType;
}

export interface FileModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  isGlobal?: boolean;
  inject?: any[];
  useFactory: (...args: any[]) =>
    | Promise<FileModuleOptions>
    | FileModuleOptions;
}