import { Module } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { CacheService } from './cache.service';

@Module({
    imports: [
        NestCacheModule.register({
            ttl: 120,
            max: 1000,
            isGlobal: true,
        }),
    ],
    providers: [CacheService],
    exports: [CacheService],
})
export class CacheModule { }