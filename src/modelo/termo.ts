import { Column, Model, Table, DataType, HasMany } from 'sequelize-typescript';
import { ColectaContenedor } from './colecta-contenedor';

@Table({
  tableName: 'termos',
  timestamps: false,
})
export class Termo extends Model<Termo> {
  @Column({ primaryKey: true, type: DataType.STRING })
  declare id: string;

  @Column(DataType.STRING)
  declare codigo: string;

  @HasMany(() => ColectaContenedor)
  declare contenedores: ColectaContenedor[];
}
