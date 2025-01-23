import { Inject, Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Product } from "./entities/product.entity";
import { Repository } from "typeorm";
import { SearchProductDto } from "./dto/search-product.dto";
import { Redis } from "ioredis";

@Injectable()
export class ProductsService {
    private readonly logger = new Logger(ProductsService.name);

    constructor(
        @InjectRepository(Product)
        private productsRepository: Repository<Product>,
        @Inject('REDIS_CLIENT')
        private readonly redisClient: Redis,
    ) { }

    async searchProducts(searchDto: SearchProductDto) {
        const startTime = Date.now();
        const page = Number(searchDto.page) || 1;
        const pageSize = Number(searchDto.pageSize) || 10;
        const cacheKey = this.generateCacheKey(searchDto);


        try {
            const cachedResult = await this.redisClient.get(cacheKey);
            if (cachedResult) {
                const parsedResult = JSON.parse(cachedResult);
                this.logPerformance(startTime, true);
                return parsedResult;
            }

            const query = this.productsRepository.createQueryBuilder('product');

            this.applyFilters(query, searchDto);

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

            await this.redisClient.set(
                cacheKey,
                JSON.stringify(result),
                'EX',
                300 //5min 
            );
            this.logPerformance(startTime, false);
            return result;
        } catch (error) {
            this.logger.error('Search failed', error);
            throw error;
        }
    }

    private applyFilters(query: any, searchDto: SearchProductDto) {
        if (searchDto.keyword) {
            query.where('(product.name ILIKE :keyword OR product.description ILIKE :keyword)', {
                keyword: `%${searchDto.keyword}%`,
            });
        }

        if (searchDto.minPrice !== undefined && searchDto.maxPrice !== undefined) {
            const minPrice = Number(searchDto.minPrice);
            const maxPrice = Number(searchDto.maxPrice);

            if (!isNaN(minPrice) && !isNaN(maxPrice)) {
                query.andWhere('product.price BETWEEN :minPrice AND :maxPrice', {
                    minPrice,
                    maxPrice,
                });
            } else {
                this.logger.warn("Invalid price range values");
            }
        }

        if (searchDto.isAvailable !== undefined) {
            query.andWhere('product.isAvailable = :isAvailable', {
                isAvailable: searchDto.isAvailable,
            });
        }
    }

    private generateCacheKey(searchDto: SearchProductDto): string {
        const key = JSON.stringify({
            keyword: searchDto.keyword,
            minPrice: searchDto.minPrice,
            maxPrice: searchDto.maxPrice,
            isAvailable: searchDto.isAvailable,
            page: searchDto.page,
            pageSize: searchDto.pageSize,
        });
        return `product_search: ${key}`;
    }

    private logPerformance(startTime: number, isCached: boolean) {
        const duration = Date.now() - startTime;
        this.logger.log({
            type: isCached ? 'cache_hit' : 'database_query',
            duration,
            isCached
        })
    }

    async invalidateCache(searchDto: SearchProductDto) {
        const cacheKey = this.generateCacheKey(searchDto);
        await this.redisClient.del(cacheKey);
    }
}