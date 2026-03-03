import {
  Column,
  Model,
  Table,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Inventario } from './inventario';
import { Cliente } from './cliente';

export enum TipoMovimiento {
  INGRESO = 'ingreso',
  SALIDA = 'salida',
}

@Table({
  tableName: 'movimientos',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
})
export class Movimiento extends Model<Movimiento> {
  @Column({ primaryKey: true, type: DataType.STRING })
  declare id: string;

  @ForeignKey(() => Inventario)
  @Column({ type: DataType.STRING, allowNull: false, field: 'inventario_id' })
  declare inventarioId: string;

  @Column({ type: DataType.ENUM('ingreso', 'salida'), allowNull: false })
  declare tipo: TipoMovimiento;

  @Column({ type: DataType.INTEGER, allowNull: false })
  declare cantidad: number;

  @Column({ type: DataType.DATE, allowNull: false, defaultValue: DataType.NOW })
  declare fecha: Date;

  @ForeignKey(() => Cliente)
  @Column({ type: DataType.STRING, allowNull: true, field: 'cliente_id' })
  declare clienteId: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare notas: string | null;

  @Column({ type: DataType.STRING, allowNull: true })
  declare remito: string | null;
  @BelongsTo(() => Inventario)
  declare inventario: Inventario;
  @BelongsTo(() => Cliente)
  declare cliente: Cliente;
}
