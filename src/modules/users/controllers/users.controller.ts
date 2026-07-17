import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../common/interfaces/authenticated-user.interface';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UsersService } from '../services/users.service';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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
}
