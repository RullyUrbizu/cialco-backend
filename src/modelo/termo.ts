import { Column, Model, Table, DataType, HasMany } from 'sequelize-typescript';
import { Colecta } from './colecta';

@Table({
  tableName: 'termos',
  timestamps: false,
})
export class Termo extends Model<Termo> {
  @Column({ primaryKey: true, type: DataType.STRING })
  declare id: string;

  @Column(DataType.STRING)
  declare codigo: string;

  @HasMany(() => Colecta)
  declare colectas: Colecta[];
}
