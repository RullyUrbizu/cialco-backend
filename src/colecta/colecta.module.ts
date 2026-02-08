import { Module } from '@nestjs/common';
import { ColectaService } from './colecta.service';
import { ColectaController } from './colecta.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Colecta } from 'src/modelo/colecta';
import { ColectaRepository } from './colecta.repository';
import { InventarioModule } from 'src/inventario/inventario.module';
import { CanastilloModule } from 'src/canastillo/canastillo.module';
import { ColectaContenedor } from 'src/modelo/colecta-contenedor';
import { ColectaContenedorRepository } from './colecta-contenedor.repository';

@Module({
  imports: [
    SequelizeModule.forFeature([Colecta, ColectaContenedor]),
    InventarioModule,
    CanastilloModule
  ],
  providers: [ColectaService, ColectaRepository, ColectaContenedorRepository],
  controllers: [ColectaController]
})
export class ColectaModule { }
