import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ToroService } from './toro.service';
import { ToroController } from './toro.controller';
import { ToroRepository } from './toro.repository';
import { Toro } from 'src/modelo/toro';

@Module({
  imports: [SequelizeModule.forFeature([Toro])],
  providers: [ToroService, ToroRepository],
  controllers: [ToroController],
})
export class ToroModule {}
