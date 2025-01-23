import { Inject, Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService {
    constructor(
        @Inject('REDIS_CLIENT')
        private readonly redisClient: Redis
    ) { }

    async get(key: string): Promise<string | null> {
        return this.redisClient.get(key);
    }

    async set(key: string, value: string, expiration?: number): Promise<void> {
        if (expiration) {
            await this.redisClient.set(key, value, 'EX', expiration);
        } else {
            await this.redisClient.set(key, value);
        }
    }

    async delete(key: string): Promise<void> {
        await this.redisClient.del(key);
    }
}