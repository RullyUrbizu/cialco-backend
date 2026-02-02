import { Column, Model, Table, DataType, HasMany } from 'sequelize-typescript';
import { Colecta } from './colecta';

@Table({ tableName: 'clientes' })
export class Cliente extends Model<Cliente> {
  @Column({ primaryKey: true, type: DataType.STRING })
  declare id: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare razonSocial: string;

  @Column({ type: DataType.STRING, allowNull: true, unique: true })
  declare cuit: string;

  @HasMany(() => Colecta)
  declare colectas: Colecta[];
}
