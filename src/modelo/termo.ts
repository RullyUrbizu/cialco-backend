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

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  declare activo: boolean;

  @HasMany(() => ColectaContenedor)
  declare contenedores: ColectaContenedor[];
}
