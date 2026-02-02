import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { MovimientoService } from './movimiento.service';
import { MovimientoController } from './movimiento.controller';
import { MovimientoRepository } from './movimiento.repository';
import { Movimiento } from 'src/modelo/movimiento';
import { InventarioModule } from 'src/inventario/inventario.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Movimiento]),
    InventarioModule
  ],
  providers: [MovimientoService, MovimientoRepository],
  controllers: [MovimientoController],
})
export class MovimientoModule { }
