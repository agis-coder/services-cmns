import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import * as crypto from 'crypto';

@Injectable()
export class CacheService {
    constructor(
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    ) { }

    async get<T>(key: string): Promise<T | null> {
        const data = await this.cacheManager.get<T>(key);
        return data ?? null;
    }

    async set(key: string, value: any, ttl = 60): Promise<void> {
        await this.cacheManager.set(key, value, ttl);
    }

    async del(key: string): Promise<void> {
        await this.cacheManager.del(key);
    }

    async wrap<T>(key: string, fn: () => Promise<T>, ttl = 60): Promise<T> {
        const cached = await this.get<T>(key);

        if (cached !== null) {
            return cached;
        }

        const result = await fn();

        await this.set(key, result, ttl);

        return result;
    }

    buildKey(prefix: string, params: any): string {
        const hash = crypto
            .createHash('md5')
            .update(JSON.stringify(params))
            .digest('hex');

        return `${prefix}:${hash}`;
    }

    async clear(key: string): Promise<void> {
        await this.del(key);
    }
}