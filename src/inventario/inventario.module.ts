import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { InventarioService } from './inventario.service';
import { InventarioController } from './inventario.controller';
import { InventarioRepository } from './inventario.repository';
import { Inventario } from 'src/modelo/inventario';

@Module({
  imports: [SequelizeModule.forFeature([Inventario])],
  providers: [InventarioService, InventarioRepository],
  controllers: [InventarioController],
  exports: [InventarioService, InventarioRepository],
})
export class InventarioModule {}
