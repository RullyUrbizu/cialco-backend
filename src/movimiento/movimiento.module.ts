import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { MovimientoService } from './movimiento.service';
import { MovimientoController } from './movimiento.controller';
import { MovimientoRepository } from './movimiento.repository';
import { Movimiento } from 'src/modelo/movimiento';
import { InventarioModule } from 'src/inventario/inventario.module';
import { ColectaContenedorRepository } from 'src/colecta/colecta-contenedor.repository';
import { ColectaContenedor } from 'src/modelo/colecta-contenedor';

@Module({
  imports: [
    SequelizeModule.forFeature([Movimiento, ColectaContenedor]),
    InventarioModule
  ],
  providers: [MovimientoService, MovimientoRepository, ColectaContenedorRepository],
  controllers: [MovimientoController],
})
export class MovimientoModule { }
