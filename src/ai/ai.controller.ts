import {
  Body,
  Controller,
  Header,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
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

  @Post('chat/stream')
  @Header('Content-Type', 'text/event-stream')
  @Header('Cache-Control', 'no-cache')
  @Header('Connection', 'keep-alive')
  @Header('X-Accel-Buffering', 'no')
  async chatStream(@Body() dto: ChatRequestDto, @Res() res: Response) {
    res.flushHeaders();

    try {
      for await (const evento of this.aiService.chatStream(dto.messages)) {
        res.write(`data: ${JSON.stringify(evento)}\n\n`);
      }
    } catch (error: unknown) {
      const mensaje = error instanceof Error ? error.message : String(error);
      res.write(
        `data: ${JSON.stringify({ type: 'error', message: mensaje })}\n\n`,
      );
    } finally {
      res.write('data: [DONE]\n\n');
      res.end();
    }
  }
}
