import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrganizationRole } from '@prisma/client';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';

export class AddMemberDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  userId!: string;

  @ApiPropertyOptional({ enum: OrganizationRole, default: OrganizationRole.MEMBER })
  @IsOptional()
  @IsEnum(OrganizationRole)
  role?: OrganizationRole;
}
