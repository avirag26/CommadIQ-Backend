import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IntegrationProvider } from '@prisma/client';
import {
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class ConnectIntegrationDto {
  @ApiProperty({ enum: IntegrationProvider })
  @IsEnum(IntegrationProvider)
  provider!: IntegrationProvider;

  @ApiProperty({ example: 'Production GA4' })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  displayName!: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  websiteId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  externalId?: string;

  @ApiPropertyOptional({
    description: 'Provider-specific credentials (stored encrypted in production)',
  })
  @IsOptional()
  @IsObject()
  credentials?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
