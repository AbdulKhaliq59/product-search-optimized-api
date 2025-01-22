import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Product } from "./entities/product.entity";
import { Repository, Between, Like } from "typeorm";
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { SearchProductDto } from "./dto/search-product.dto";
import { Cache } from "cache-manager";

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Product)
        private productsRepository: Repository<Product>,
        @Inject(CACHE_MANAGER)
        private cacheManager: Cache,
    ) { }

    async searchProducts(searchDto: SearchProductDto) {
        const page = Number(searchDto.page) || 1;
        const pageSize = Number(searchDto.pageSize) || 10;
        const cachedKey = this.generateCacheKey(searchDto);
        const cachedResult = await this.cacheManager.get(cachedKey);

        console.log("Cached data", cachedResult);

        if (cachedResult) {
            return cachedResult;
        }

        const query = this.productsRepository.createQueryBuilder('product');

        // Corrected query: Group the OR condition for keyword
        if (searchDto.keyword) {
            query.where('(product.name ILIKE :keyword OR product.description ILIKE :keyword)', {
                keyword: `%${searchDto.keyword}%`,
            });
        }

        // Apply price range filter
        if (searchDto.minPrice !== undefined && searchDto.maxPrice !== undefined) {
            const minPrice = Number(searchDto.minPrice);
            const maxPrice = Number(searchDto.maxPrice);

            if (!isNaN(minPrice) && !isNaN(maxPrice)) {
                console.log("MinPrice & MaxPrice", minPrice, maxPrice);
                query.andWhere('product.price BETWEEN :minPrice AND :maxPrice', {
                    minPrice,
                    maxPrice,
                });
            } else {
                console.error("Invalid price range values:", searchDto.minPrice, searchDto.maxPrice);
            }
        }

        // Apply availability filter
        if (searchDto.isAvailable !== undefined) {
            console.log("isAvailable filter", searchDto.isAvailable);
            query.andWhere('product.isAvailable = :isAvailable', {
                isAvailable: searchDto.isAvailable,
            });
        }
        console.log("Query", query.getQuery());

        query
            .orderBy('product.price', 'ASC')
            .skip((page - 1) * pageSize)
            .take(pageSize);

        const [items, total] = await query.getManyAndCount();

        const result = {
            items,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
        };

        await this.cacheManager.set(cachedKey, result, 300000); // 5 minutes
        return result;
    }


    private generateCacheKey(searchDto: SearchProductDto): string {
        return `products_search_${JSON.stringify(searchDto)}`;
    }
}