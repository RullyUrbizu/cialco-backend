import { Column, Model, Table, DataType, ForeignKey, BelongsTo, HasOne, HasMany } from 'sequelize-typescript';
import { Toro } from './toro';
import { Cliente } from './cliente';
import { Inventario } from './inventario';
import { ColectaContenedor } from './colecta-contenedor';

@Table({ tableName: 'colectas' })
export class Colecta extends Model<Colecta> {
    @Column({ primaryKey: true, type: DataType.STRING })
    declare id: string;

    @ForeignKey(() => Toro)
    @Column({ type: DataType.STRING, field: 'toro_id' })
    declare toroId: string;

    @ForeignKey(() => Cliente)
    @Column({ type: DataType.STRING, field: 'cliente_id' })
    declare clienteId: string;

    @Column(DataType.DATEONLY)
    declare fecha: Date;

    @Column(DataType.STRING)
    declare vigorMot: string;

    @Column(DataType.INTEGER)
    declare cantidad: number;

    @Column(DataType.INTEGER)
    declare ingreso: number;

    @Column(DataType.INTEGER)
    declare sale: number;

    @Column(DataType.INTEGER)
    declare stock: number;

    @BelongsTo(() => Toro)
    declare toro: Toro;

    @BelongsTo(() => Cliente)
    declare cliente: Cliente;

    @HasMany(() => ColectaContenedor, { as: 'contenedores' })
    declare contenedores: ColectaContenedor[];

    @HasOne(() => Inventario)
    declare inventario: Inventario;
}
