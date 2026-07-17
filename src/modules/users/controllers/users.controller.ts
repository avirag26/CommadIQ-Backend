import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../common/interfaces/authenticated-user.interface';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UsersService } from '../services/users.service';
import { StorageProvider } from '../../storage/interfaces/storage-provider.interface';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly storageProvider: StorageProvider,
  ) {}

  @Get('me')
  @ApiOperation({ summary: 'Get the authenticated user profile' })
  getMe(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.getCurrentUser(user.id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update the authenticated user profile' })
  updateMe(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.updateUser(user.id, dto);
  }

  @Delete('me')
  @ApiOperation({ summary: 'Deactivate the authenticated user account' })
  deleteMe(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.deleteUser(user.id);
  }

  @Post('me/avatar')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload user avatar' })
  async uploadAvatar(
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Avatar file is required');
    }
    const avatarUrl = await this.storageProvider.uploadFile(file);
    return this.usersService.updateUser(user.id, { avatarUrl });
  }
}
