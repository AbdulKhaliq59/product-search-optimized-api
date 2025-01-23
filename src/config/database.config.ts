import { TypeOrmModuleOptions } from "@nestjs/typeorm";


export const databaseConfig = (): TypeOrmModuleOptions => ({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: ['dist/**/*.entity{.ts,.js}'],
    synchronize: process.env.NODE_ENV !== 'production',
    ssl: {
        rejectUnauthorized: false
    }
})