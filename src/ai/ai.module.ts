import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { AiDataService } from './ai.data.service';
import { Toro } from 'src/modelo/toro';
import { Colecta } from 'src/modelo/colecta';
import { Inventario } from 'src/modelo/inventario';
import { ColectaContenedor } from 'src/modelo/colecta-contenedor';
import { Termo } from 'src/modelo/termo';
import { Canastillo } from 'src/modelo/canastillo';
import { Cliente } from 'src/modelo/cliente';
import { Movimiento } from 'src/modelo/movimiento';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Toro,
      Colecta,
      Inventario,
      ColectaContenedor,
      Termo,
      Canastillo,
      Cliente,
      Movimiento,
    ]),
  ],
  controllers: [AiController],
  providers: [AiService, AiDataService],
})
export class AiModule {}
