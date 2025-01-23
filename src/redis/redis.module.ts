import { Module } from '@nestjs/common';
import * as Redis from 'ioredis';
import { RedisService } from './redis.service';

@Module({
    providers: [
        {
            provide: 'REDIS_CLIENT',
            useFactory: () => {
                const redisUrl = process.env.REDIS_URL;
                if (!redisUrl) {
                    throw new Error('REDIS_URL is not defined');
                }
                return new Redis.default(redisUrl);
            }
        },
        RedisService
    ],
    exports: ['REDIS_CLIENT', RedisService]
})
export class RedisModule { }
