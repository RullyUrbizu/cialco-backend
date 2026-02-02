import { Column, Model, Table, DataType, HasMany } from 'sequelize-typescript';
import { Colecta } from './colecta';

export enum RazaEnum {
  AA = 'AA',
  AAC = 'AAC',
  AAN = 'AAN',
  PH = 'PH',
  SH = 'SH',
  LMAn = 'LMAn',
}

@Table({ tableName: 'toros' })
export class Toro extends Model<Toro> {
  @Column({ primaryKey: true, type: DataType.STRING })
  declare id: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare nombre: string;

  @Column({ type: DataType.ENUM(...Object.values(RazaEnum)), allowNull: false })
  declare raza: RazaEnum;

  @HasMany(() => Colecta)
  declare colectas: Colecta[];
}
