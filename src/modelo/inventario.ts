import {
  Column,
  Model,
  Table,
  DataType,
  ForeignKey,
} from 'sequelize-typescript';
import { Colecta } from './colecta';

@Table({ tableName: 'inventario' })
export class Inventario extends Model<Inventario> {
  @Column({ primaryKey: true, type: DataType.STRING })
  declare id: string;

  @ForeignKey(() => Colecta)
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
    field: 'colecta_id',
  })
  declare colectaId: string;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  declare cantidadInicial: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  declare ingresosTotal: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  declare salidasTotal: number;

  @Column({
    type: DataType.INTEGER,
    field: 'stock_actual',
  })
  declare stockActual: number;
}
