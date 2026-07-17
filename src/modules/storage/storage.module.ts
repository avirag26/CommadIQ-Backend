import { Module } from '@nestjs/common';
import { StorageProvider } from './interfaces/storage-provider.interface';
import { CloudinaryStorageProvider } from './providers/cloudinary.provider';

@Module({
  providers: [
    {
      provide: StorageProvider,
      useClass: CloudinaryStorageProvider,
    },
  ],
  exports: [StorageProvider],
})
export class StorageModule {}
