# FileModule - Módulo de Carga de Archivos

Módulo NestJS configurable para la carga de archivos usando Multer con validación de tipo y tamaño.

## 🎯 Características

- ✅ Validación de tipos de archivo (image, pdf, any)
- ✅ Límite de tamaño configurable
- ✅ Storage configurable (memoria o disco)
- ✅ Configuración síncrona o asíncrona
- ✅ Integración con `@nestjs/config`
- ✅ TypeScript con tipos estrictos
- ✅ Filtros de archivos automáticos

## 📦 Instalación

```bash
npm install @nestjs/platform-express multer
npm install -D @types/multer
```

## 🚀 Uso Básico

### 1. Importar el módulo

#### Configuración Síncrona (valores fijos)

```typescript
import { FileModule } from './shared/modules/file-upload.module';

@Module({
  imports: [
    FileModule.forRoot({
      maxFileSizeKb: 500,           // 500 KB
      allowedTypes: ['image'],      // Solo imágenes
      storage: 'memory',            // En RAM
    }),
  ],
})
export class AppModule {}
```

#### Configuración Asíncrona (con ConfigService)

```typescript
import { FileModule } from './shared/modules/file-upload.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    FileModule.forRootAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        maxFileSizeKb: config.get('MAX_FILE_SIZE_KB', 150),
        allowedTypes: ['image', 'pdf'],
        storage: config.get('FILE_STORAGE', 'memory'),
      }),
    }),
  ],
})
export class AppModule {}
```

### 2. Usar en un Controlador

El módulo incluye un controlador por defecto en `/files`:

```typescript
POST   /files/upload   - Subir archivo
GET    /files/config   - Ver configuración actual
```

#### Crear tu propio endpoint

```typescript
import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('images')
export class ImagesController {
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))  // 'file' = nombre del campo
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    // Con storage: 'memory'
    const buffer = file.buffer;           // Buffer con los bytes
    const size = file.buffer.length;      // Tamaño en bytes
    
    // Con storage: 'disk'
    const path = file.path;               // Ruta del archivo guardado
    const filename = file.filename;       // Nombre generado
    
    return {
      message: 'Archivo recibido',
      name: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    };
  }
}
```

## ⚙️ Opciones de Configuración

### FileModuleOptions

| Opción | Tipo | Descripción | Ejemplo |
|--------|------|-------------|---------|
| `maxFileSizeKb` | `number` | Tamaño máximo en KB | `150` |
| `allowedTypes` | `Array<'image' \| 'pdf' \| 'any'>` | Tipos permitidos | `['image', 'pdf']` |
| `storage` | `'memory' \| 'disk'` | Dónde guardar archivos | `'memory'` |

### Tipos de Archivo

- **`'image'`**: Acepta `image/*` (jpeg, png, webp, gif, etc.)
- **`'pdf'`**: Acepta `application/pdf`
- **`'any'`**: Acepta cualquier tipo de archivo

### Storage

#### Memory Storage (`storage: 'memory'`)

✅ **Ventajas:**
- Más rápido (RAM)
- Ideal para procesamiento inmediato
- No deja archivos huérfanos

❌ **Desventajas:**
- Consume RAM
- Se pierde al terminar el request
- No apto para archivos grandes

**Uso:**
```typescript
const buffer = file.buffer;  // Buffer<bytes>
// Procesar con Sharp, subir a S3, etc.
```

#### Disk Storage (`storage: 'disk'`)

✅ **Ventajas:**
- Persistencia automática
- Menor uso de RAM
- Sirve archivos estáticos

❌ **Desventajas:**
- I/O de disco (más lento)
- Requiere limpieza manual
- Necesita permisos de escritura

**Ubicación:** `./uploads/` (creada automáticamente)

**Nombre generado:** `{timestamp}-{random}.{ext}`

**Uso:**
```typescript
const filePath = file.path;      // './uploads/1736217843000-123456789.jpg'
const filename = file.filename;  // '1736217843000-123456789.jpg'
```

## 🔧 Arquitectura del Módulo

```
src/shared/modules/
├── README.md                          ← Este archivo
├── file-upload.module.ts              ← Módulo principal
├── constants/
│   └── file-upload.constants.ts       ← Tokens de inyección
├── interfaces/
│   ├── file-upload-config.port.ts     ← Puerto/interfaz
│   └── file-upload-module-options.interface.ts
├── infrastructure/
│   ├── controllers/
│   │   └── file.controller.ts         ← Endpoint /files/upload
│   └── factorys/
│       └── multer-options.factory.ts  ← Configuración de Multer
└── application/
    └── services/
        └── file-upload-config.service.ts
```

## 📝 Ejemplos Completos

### Frontend: Subir imagen con compresión

```javascript
const formData = new FormData();
formData.append('file', imageBlob, 'imagen.jpg');

const response = await fetch('http://localhost:3000/files/upload', {
  method: 'POST',
  body: formData,
});

const result = await response.json();
console.log(result); // { message: '...', originalName: '...', size: ... }
```

### Backend: Procesar imagen con Sharp

```typescript
import * as sharp from 'sharp';

@Post('upload')
@UseInterceptors(FileInterceptor('file'))
async uploadAndResize(@UploadedFile() file: Express.Multer.File) {
  // Redimensionar con Sharp (requiere buffer en memoria)
  const resizedBuffer = await sharp(file.buffer)
    .resize(800, 600, { fit: 'inside' })
    .jpeg({ quality: 80 })
    .toBuffer();

  // Aquí puedes subir a S3, Cloudinary, etc.
  
  return {
    message: 'Imagen procesada',
    originalSize: file.size,
    processedSize: resizedBuffer.length,
  };
}
```

### Backend: Guardar en disco y servir archivos

```typescript
// app.module.ts
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    FileModule.forRoot({
      storage: 'disk',
      maxFileSizeKb: 2048,
      allowedTypes: ['image'],
    }),
  ],
})
export class AppModule {}

// Acceso: http://localhost:3000/uploads/1736217843000-123456789.jpg
```

## 🐛 Debugging

El módulo incluye logs automáticos:

```typescript
[Nest] FileController initialized with config: { maxFileSizeKb: 150, ... }
[Nest] 📦 Imagen recibida: {
  nombre: 'foto.jpg',
  tamaño: '45 KB',
  tipo: 'image/jpeg',
  multipart: '✅',
  enMemoria: '✅ Buffer 46234 bytes',
  primerosBytes: 'ffd8ffe000104a46494600010101'
}
```

## 🚨 Manejo de Errores

### Archivo muy grande

Multer rechaza automáticamente y retorna **413 Payload Too Large**.

### Tipo no permitido

El `fileFilter` rechaza y retorna **400 Bad Request** con mensaje `"Tipo de archivo no permitido"`.

### Campo incorrecto

Si envías `formData.append('imagen', file)` pero el interceptor espera `'file'`, retorna:

```json
{
  "error": true,
  "message": "No file provided"
}
```

## 🔐 CORS

Para permitir uploads desde frontend, habilita CORS en `main.ts`:

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: true,  // O especifica orígenes: ['http://localhost:4200']
    methods: 'GET,POST',
  });
  
  await app.listen(3000);
}
```

## 📚 Referencias

- [NestJS File Upload](https://docs.nestjs.com/techniques/file-upload)
- [Multer Documentation](https://github.com/expressjs/multer)
- [Sharp (procesamiento de imágenes)](https://sharp.pixelplumbing.com/)

---

**Autor:** PoC Multer  
**Versión:** 1.0.0  
**Última actualización:** 7 de enero de 2026
