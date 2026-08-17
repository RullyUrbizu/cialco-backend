import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AiService, ChatRespuesta } from './ai.service';
import { ChatRequestDto } from './ai.dto';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  @HttpCode(HttpStatus.OK)
  async chat(@Body() dto: ChatRequestDto): Promise<ChatRespuesta> {
    return this.aiService.chat(dto.messages);
  }
}
