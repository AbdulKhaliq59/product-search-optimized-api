import { TypeOrmModuleOptions } from "@nestjs/typeorm";


export const databaseConfig = (): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME,
    password: `${process.env.DB_PASSWORD}`,
    database: process.env.DB_NAME || "products",
    entities: ['dist/**/*.entity{.ts,.js}'],
    synchronize: process.env.NODE_ENV !== 'production',
})