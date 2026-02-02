import { Body, Controller, Get, Param, Post, Put, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { InventarioService } from './inventario.service';
import { Inventario } from 'src/modelo/inventario';
import { CreateInventarioDto, UpdateInventarioDto } from 'src/dto/inventario.dto';

@Controller('inventario')
export class InventarioController {
  constructor(private readonly inventarioService: InventarioService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createInventarioDto: CreateInventarioDto): Promise<Inventario> {
    return this.inventarioService.create(createInventarioDto);
  }

  @Get()
  findAll(): Promise<Inventario[]> {
    return this.inventarioService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string): Promise<Inventario | null> {
    return this.inventarioService.findById(id);
  }

  @Get('colecta/:colectaId')
  findByColectaId(@Param('colectaId') colectaId: string): Promise<Inventario | null> {
    return this.inventarioService.findByColectaId(colectaId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateInventarioDto: UpdateInventarioDto): Promise<Inventario | null> {
    return this.inventarioService.update(id, updateInventarioDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<void> {
    await this.inventarioService.delete(id);
  }
}
