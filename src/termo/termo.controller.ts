import { Body, Controller, Get, Param, Post, Put, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { TermoService } from './termo.service';
import { Termo } from 'src/modelo/termo';
import { CreateTermoDto, UpdateTermoDto } from 'src/dto/termo.dto';

@Controller('termos')
export class TermoController {
  constructor(private readonly termoService: TermoService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createTermoDto: CreateTermoDto): Promise<Termo> {
    return this.termoService.create(createTermoDto);
  }

  @Get()
  findAll(): Promise<Termo[]> {
    return this.termoService.findAll();
  }

  @Get('stock-summary')
  getStockSummary(): Promise<any[]> {
    return this.termoService.getStockSummary();
  }

  @Get(':id')
  findById(@Param('id') id: string): Promise<Termo | null> {
    return this.termoService.findById(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateTermoDto: UpdateTermoDto): Promise<Termo | null> {
    return this.termoService.update(id, updateTermoDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<void> {
    await this.termoService.delete(id);
  }
}
