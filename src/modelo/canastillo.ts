import { Column, Model, Table, DataType, HasMany } from 'sequelize-typescript';
import { Colecta } from './colecta';

@Table({
  tableName: 'canastillos',
  timestamps: false,
})
export class Canastillo extends Model<Canastillo> {
  @Column({ primaryKey: true, type: DataType.STRING })
  declare id: string;

  @Column(DataType.STRING)
  declare codigo: string;

  @Column(DataType.STRING)
  declare termoId: string;

  @HasMany(() => Colecta)
  declare colectas: Colecta[];
}
