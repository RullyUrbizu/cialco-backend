import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TermoService } from './termo.service';
import { TermoController } from './termo.controller';
import { TermoRepository } from './termo.repository';
import { Termo } from 'src/modelo/termo';

@Module({
  imports: [SequelizeModule.forFeature([Termo])],
  providers: [TermoService, TermoRepository],
  controllers: [TermoController],
})
export class TermoModule {}
