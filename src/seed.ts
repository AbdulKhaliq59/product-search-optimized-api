import * as dotenv from "dotenv";
dotenv.config();

import { DataSource } from 'typeorm';
import { Product } from './products/entities/product.entity';

import { DataSourceOptions } from 'typeorm';

const databaseConfig: DataSourceOptions = {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [__dirname + '/products/entities/*.entity.{ts,js}'],
    synchronize: process.env.NODE_ENV !== 'production',
};

// Create a DataSource instance
const dataSource = new DataSource(databaseConfig);

async function seed() {
    try {
        await dataSource.initialize(); // Initialize the DataSource
        const productRepository = dataSource.getRepository(Product);

        const products = Array.from({ length: 10000 }, (_, i) => ({
            name: `Product ${i + 1}`,
            description: `Description for product ${i + 1}`,
            price: parseFloat((Math.random() * 1000).toFixed(2)),
            isAvailable: Math.random() > 0.2,
        }));

        await productRepository.save(products);
        console.log('Seeded 10,000 products');
    } catch (error) {
        console.error('Error seeding data:', error);
    } finally {
        await dataSource.destroy(); // Close the connection
    }
}

seed();
