import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FileModule } from './shared/modules/file-upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    FileModule.forRootAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: (_config: ConfigService) => ({
        // Configuración tipada según FileModuleOptions
        maxFileSizeKb: 150, // 150 KB
        allowedTypes: ['image'],
        storage: 'memory', 
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
