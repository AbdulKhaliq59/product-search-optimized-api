import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Entity('products')
export class Product {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @Index('idx_product_name')
    name: string;

    @Column()
    description: string;

    @Column('decimal', { precision: 10, scale: 2 })
    @Index('idx_product_price')
    price: number;

    @Column()
    @Index('idx_product_availability')
    isAvailable: boolean;
}