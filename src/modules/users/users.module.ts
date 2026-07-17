import { Module } from '@nestjs/common';
import { UsersController } from './controllers/users.controller';
import { UserRepository } from './repositories/user.repository';
import { UsersService } from './services/users.service';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [StorageModule],
  controllers: [UsersController],
  providers: [UsersService, UserRepository],
  exports: [UsersService],
})
export class UsersModule {}
