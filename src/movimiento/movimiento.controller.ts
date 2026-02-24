import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MovimientoService } from './movimiento.service';
import { Movimiento } from 'src/modelo/movimiento';
import {
  CreateMovimientoDto,
  UpdateMovimientoDto,
} from 'src/dto/movimiento.dto';

@Controller('movimientos')
export class MovimientoController {
  constructor(private readonly movimientoService: MovimientoService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createMovimientoDto: CreateMovimientoDto,
  ): Promise<Movimiento> {
    try {
      console.log(
        'Recibiendo datos de movimiento:',
        JSON.stringify(createMovimientoDto, null, 2),
      );
      const result = await this.movimientoService.create(createMovimientoDto);
      console.log('Movimiento creado exitosamente:', result.id);
      return result;
    } catch (error) {
      console.error('Error en controlador de movimientos:', error);
      throw error;
    }
  }

  @Get()
  findAll(): Promise<Movimiento[]> {
    return this.movimientoService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string): Promise<Movimiento | null> {
    return this.movimientoService.findById(id);
  }

  @Get('inventario/:inventarioId')
  findByInventario(
    @Param('inventarioId') inventarioId: string,
  ): Promise<Movimiento[]> {
    return this.movimientoService.findByInventario(inventarioId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateMovimientoDto: UpdateMovimientoDto,
  ): Promise<Movimiento | null> {
    return this.movimientoService.update(id, updateMovimientoDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<void> {
    await this.movimientoService.delete(id);
  }
}
