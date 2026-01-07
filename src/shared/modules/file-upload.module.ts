import { DynamicModule, Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { MulterOptionsFactory } from './infrastructure/factorys/multer-options.factory';
import { FileModuleAsyncOptions, FileModuleOptions } from './interfaces/file-upload-module-options.interface';
import { FILE_MODULE_OPTIONS } from './constants/file-upload.constants';
import { FileController } from './infrastructure/controllers/file.controller';

@Module({})
export class FileModule {
  static forRootAsync(options: FileModuleAsyncOptions): DynamicModule {
    return {
      module: FileModule,
      global: options.isGlobal ?? false,
      controllers: [FileController],
      imports: [
        ...(options.imports || []),
        MulterModule.registerAsync({
          useFactory: async (...args: any[]) => {
            const config: FileModuleOptions =
              await options.useFactory(...args);

            return MulterOptionsFactory.create(config);
          },
          inject: options.inject || [],
        }),
      ],
      providers: [
        {
          provide: FILE_MODULE_OPTIONS,
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
      ],
      exports: [FILE_MODULE_OPTIONS],
    };
  }
}