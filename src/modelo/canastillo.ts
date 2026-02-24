import { Column, Model, Table, DataType, HasMany } from 'sequelize-typescript';
import { ColectaContenedor } from './colecta-contenedor';

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

  @HasMany(() => ColectaContenedor)
  declare contenedores: ColectaContenedor[];
}
