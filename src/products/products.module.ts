import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Product } from "./entities/product.entity";
import { ProductsController } from "./products.controller";
import { ProductsService } from "./products.service";
import { RedisModule } from "src/redis/redis.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Product]),
        RedisModule
    ],
    controllers: [ProductsController],
    providers: [ProductsService],
    exports: [ProductsService]
})

export class ProductsModule { }