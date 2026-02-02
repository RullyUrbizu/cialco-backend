import { Body, Controller, Get, Param, Post, Put, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { ToroService } from './toro.service';
import { Toro } from 'src/modelo/toro';
import { CreateToroDto, UpdateToroDto } from 'src/dto/toro.dto';

@Controller('toros')
export class ToroController {
  constructor(private readonly toroService: ToroService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createToroDto: CreateToroDto): Promise<Toro> {
    return this.toroService.create(createToroDto);
  }

  @Get()
  findAll(): Promise<Toro[]> {
    return this.toroService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string): Promise<Toro | null> {
    return this.toroService.findById(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateToroDto: UpdateToroDto): Promise<Toro | null> {
    return this.toroService.update(id, updateToroDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<void> {
    await this.toroService.delete(id);
  }
}
