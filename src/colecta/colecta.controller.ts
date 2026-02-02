import { Controller, Get, Post, Body, Param, Put, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { ColectaService } from './colecta.service';
import { Colecta } from 'src/modelo/colecta';
import { CreateColectaDto, UpdateColectaDto } from 'src/dto/colecta.dto';

@Controller('colectas')
export class ColectaController {
  constructor(private readonly colectaService: ColectaService) {}

  /**
   * Crear una nueva colecta
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createColectaDto: CreateColectaDto): Promise<Colecta> {
    return this.colectaService.create(createColectaDto);
  }

  /**
   * Obtener todas las colectas
   */
  @Get()
  async findAll(): Promise<Colecta[]> {
    return this.colectaService.findAll();
  }

  /**
   * Obtener una colecta por ID
   */
  @Get(':id')
  async findById(@Param('id') id: string): Promise<Colecta | null> {
    return this.colectaService.findById(id);
  }

  /**
   * Obtener colectas por razón social del cliente
   */
  @Get('cliente/razon-social/:razonSocial')
  async findAllWithCliente(
    @Param('razonSocial') razonSocial: string,
  ): Promise<Colecta[]> {
    return this.colectaService.findAllWithCliente(razonSocial);
  }

  /**
   * Obtener colectas por nombre del toro
   */
  @Get('toro/nombre/:nombre')
  async findAllByToroNombre(
    @Param('nombre') nombre: string,
  ): Promise<Colecta[]> {
    return this.colectaService.findAllWithToroNombre(nombre);
  }

  /**
   * Actualizar una colecta
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateColectaDto: UpdateColectaDto,
  ): Promise<Colecta | null> {
    return this.colectaService.update(id, updateColectaDto);
  }

  /**
   * Eliminar una colecta
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<void> {
    await this.colectaService.delete(id);
  }
}
