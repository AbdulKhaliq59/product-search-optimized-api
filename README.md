# Product Search API

## Overview
A high-performance NestJS product search API with Redis caching and PostgreSQL backend.

## Prerequisites
- Node.js 18+
- PostgreSQL 16+
- Redis 6+

## Setup Instructions

### 1. Clone Repository
```bash
git clone https://github.com/AbdulKhaliq59/product-search-optimized-api
cd product-search-api
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create `.env` file:
```
DATABASE_URL=postgresql://user:password@localhost:5432/productdb
REDIS_URL=redis://localhost:6379
```

### 4. Database Setup
```bash

# Seed sample data
npm run db:seed
```

### 5. Start Application
```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## API Endpoints
- `GET /api/v1/products/search`
  - Query Parameters:
    - `keyword` (required): Product search term
    - `minPrice` (optional): Minimum price filter
    - `maxPrice` (optional): Maximum price filter
    - `isAvailable` (optional): Product availability
    - `page` (optional): Result page number
    - `pageSize` (optional): Results per page

## Performance Notes
- Cached queries: <200ms response
- Non-cached queries: <500ms response

## Hosted Link
The API is also hosted on Render: [Product Search API on Render](https://product-search-optimized-api.onrender.com)