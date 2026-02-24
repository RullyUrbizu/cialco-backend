import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ClienteService } from './cliente.service';
import { ClienteController } from './cliente.controller';
import { ClienteRepository } from './cliente.repository';
import { Cliente } from 'src/modelo/cliente';

@Module({
  imports: [SequelizeModule.forFeature([Cliente])],
  providers: [ClienteService, ClienteRepository],
  controllers: [ClienteController],
  exports: [ClienteService, ClienteRepository],
})
export class ClienteModule {}
