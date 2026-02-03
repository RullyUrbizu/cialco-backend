import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CanastilloService } from './canastillo.service';
import { CanastilloController } from './canastillo.controller';
import { CanastilloRepository } from './canastillo.repository';
import { Canastillo } from 'src/modelo/canastillo';

@Module({
  imports: [SequelizeModule.forFeature([Canastillo])],
  providers: [CanastilloService, CanastilloRepository],
  controllers: [CanastilloController],
  exports: [CanastilloService, CanastilloRepository]
})
export class CanastilloModule { }
