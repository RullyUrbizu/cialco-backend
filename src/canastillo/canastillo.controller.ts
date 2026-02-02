import { Body, Controller, Get, Param, Post, Put, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { CanastilloService } from './canastillo.service';
import { Canastillo } from 'src/modelo/canastillo';
import { CreateCanastilloDto, UpdateCanastilloDto } from 'src/dto/canastillo.dto';

@Controller('canastillos')
export class CanastilloController {
  constructor(private readonly canastilloService: CanastilloService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createCanastilloDto: CreateCanastilloDto): Promise<Canastillo> {
    return this.canastilloService.create(createCanastilloDto);
  }

  @Get()
  findAll(): Promise<Canastillo[]> {
    return this.canastilloService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string): Promise<Canastillo | null> {
    return this.canastilloService.findById(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateCanastilloDto: UpdateCanastilloDto): Promise<Canastillo | null> {
    return this.canastilloService.update(id, updateCanastilloDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<void> {
    await this.canastilloService.delete(id);
  }
}
