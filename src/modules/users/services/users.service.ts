import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { HttpMessage } from '../../../common/enums/http-message.enum';
import { AuthenticatedUser } from '../../../common/interfaces/authenticated-user.interface';
import { successResponse } from '../../../common/utils/response.util';
import { USER_MESSAGES } from '../constants/users.constants';
import { CreateUserInternalDto } from '../dto/create-user-internal.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserEntity } from '../entities/user.entity';
import { UserRepository } from '../repositories/user.repository';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  createUser(data: CreateUserInternalDto) {
    return this.userRepository.create(data);
  }

  findById(id: string) {
    return this.userRepository.findById(id);
  }

  findByEmail(email: string) {
    return this.userRepository.findByEmail(email);
  }

  async getCurrentUser(userId: string) {
    const user = await this.requireUser(userId);
    return successResponse(
      this.toPublicUser(user),
      USER_MESSAGES.PROFILE_FETCHED,
    );
  }

  async updateUser(userId: string, dto: UpdateUserDto) {
    await this.requireUser(userId);
    const updated = await this.userRepository.update(userId, dto);
    return successResponse(
      this.toPublicUser(updated),
      USER_MESSAGES.PROFILE_UPDATED,
    );
  }

  async deleteUser(userId: string) {
    await this.requireUser(userId);
    await this.userRepository.softDelete(userId);
    return successResponse(null, USER_MESSAGES.PROFILE_DELETED);
  }

  toPublicUser(user: UserEntity) {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  toAuthenticatedUser(user: UserEntity): AuthenticatedUser {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }

  private async requireUser(userId: string): Promise<UserEntity> {
    const user = await this.userRepository.findById(userId);
    if (!user || !user.isActive) {
      throw new NotFoundException(HttpMessage.NOT_FOUND);
    }
    return user;
  }
}
