import * as dotenv from "dotenv";
dotenv.config();

import { DataSource } from 'typeorm';
import { Product } from './products/entities/product.entity';

import { DataSourceOptions } from 'typeorm';

const databaseConfig: DataSourceOptions = {
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [__dirname + '/products/entities/*.entity.{ts,js}'],
    synchronize: process.env.NODE_ENV !== 'production',
    ssl: {
        rejectUnauthorized: false
    },
    logging: true
};

// Create a DataSource instance
const dataSource = new DataSource(databaseConfig);

async function generateProducts(count: number) {
    const categories = [
        'Electronics', 'Clothing', 'Home & Garden',
        'Books', 'Sports', 'Toys', 'Beauty'
    ]
    return Array.from({ length: count }, (_, i) => ({
        name: `${categories[i % categories.length]} Product ${i + 1}`,
        description: `High-quality ${categories[i % categories.length]} item with unique features and exceptional value.`,
        price: parseFloat((Math.random() * 1000).toFixed(2)),
        isAvailable: Math.random() > 0.2,
    }))
}
async function seed() {
    console.log("Starting seeding process...");
    console.log("Database URL: ", process.env.DATABASE_URL);
    try {
        await dataSource.initialize();
        console.log("Database connection established");

        const productRepository = dataSource.getRepository(Product);

        await productRepository.clear();
        console.log("Existing products cleared");


        const products = await generateProducts(10000);
        const batchSize = 1000;

        for (let i = 0; i < products.length; i += batchSize) {
            const batch = products.slice(i, i + batchSize);
            await productRepository.save(batch);
            console.log(`Seeded ${i + batch.length} products...`);
        }
        console.log("Successfully seeded 10,000 products");

        await productRepository.save(products);
        console.log('Seeded 10,000 products');
    } catch (error) {
        console.error('Error seeding data:', error);
    } finally {
        await dataSource.destroy(); // Close the connection
    }
}

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});



seed();
