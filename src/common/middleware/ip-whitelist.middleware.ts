import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class IpWhitelistMiddleware implements NestMiddleware {
    private readonly allowedIps = [
        '127.0.0.1',
        '::1',
        '192.168.1.156',
    ];

    use(req: Request, res: Response, next: NextFunction) {
        const ip =
            (req.headers['x-forwarded-for'] as string)?.split(',')[0] ??
            req.socket.remoteAddress ??
            '';

        if (!this.allowedIps.includes(ip)) {
            throw new ForbiddenException('Your IP is not allowed');
        }

        next();
    }
}
