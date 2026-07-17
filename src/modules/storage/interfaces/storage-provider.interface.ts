import { Injectable } from '@nestjs/common';

export abstract class StorageProvider {
  /**
   * Uploads a file and returns the public URL.
   */
  abstract uploadFile(file: Express.Multer.File): Promise<string>;
}
