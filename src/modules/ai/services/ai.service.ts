import { Injectable } from '@nestjs/common';
import { successResponse } from '../../../common/utils/response.util';

@Injectable()
export class AiService {
  getStatus() {
    return successResponse(
      {
        ready: false,
        message:
          'AI module scaffolded. Provider adapters and orchestration will be added later.',
      },
      'AI foundation ready',
    );
  }
}
