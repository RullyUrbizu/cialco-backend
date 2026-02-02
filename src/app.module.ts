import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ColectaModule } from './colecta/colecta.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { ToroModule } from './toro/toro.module';
import { TermoModule } from './termo/termo.module';
import { CanastilloModule } from './canastillo/canastillo.module';
import { ClienteModule } from './cliente/cliente.module';
import { InventarioModule } from './inventario/inventario.module';
import { MovimientoModule } from './movimiento/movimiento.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SequelizeModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        dialect: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        autoLoadModels: true,
        synchronize: configService.get<string>('NODE_ENV') !== 'production',
        define: {
          underscored: true,
        },
      }),
    }),
    ColectaModule,
    ToroModule,
    TermoModule,
    CanastilloModule,
    ClienteModule,
    InventarioModule,
    MovimientoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
