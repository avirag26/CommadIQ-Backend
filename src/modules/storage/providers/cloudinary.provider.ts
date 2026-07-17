import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import { StorageProvider } from '../interfaces/storage-provider.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CloudinaryStorageProvider implements StorageProvider {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    try {
      const b64 = Buffer.from(file.buffer).toString('base64');
      const dataURI = `data:${file.mimetype};base64,${b64}`;

      const result = await cloudinary.uploader.upload(dataURI, {
        folder: 'commandiq/avatars',
        public_id: `${uuidv4()}`,
      });

      return result.secure_url;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new InternalServerErrorException('Failed to upload image');
    }
  }
}
