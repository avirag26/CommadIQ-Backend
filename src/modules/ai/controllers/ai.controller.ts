import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AiService } from '../services/ai.service';

@ApiTags('AI')
@ApiBearerAuth()
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('status')
  @ApiOperation({
    summary: 'AI module status (foundation stub — no LLM logic yet)',
  })
  status() {
    return this.aiService.getStatus();
  }
}
