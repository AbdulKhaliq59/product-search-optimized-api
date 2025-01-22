import { Controller, Get, Query } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { ProductsService } from "./products.service";
import { SearchProductDto } from "./dto/search-product.dto";


@Controller('api/v1/products')
@ApiTags('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Get('search')
    @ApiOperation({ summary: 'Search products with filters' })
    async searchProducts(@Query() searchDto: SearchProductDto) {
        return this.productsService.searchProducts(searchDto);
    }
}