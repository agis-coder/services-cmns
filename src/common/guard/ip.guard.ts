import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import DeviceDetector from 'node-device-detector';
import axios from 'axios';

@Injectable()
export class IpGuard implements CanActivate {
    private readonly allowedIps = [
        '127.0.0.1',
        '::1',
        '192.168.1.156',
        '192.168.1.111',
        '192.168.1.175',
        '192.168.1.112',
        '192.168.1.33',
        '192.168.1.177',
        '192.168.1.170',
        '14.187.103.108'

    ];

    private detector = new DeviceDetector({
        clientIndexes: true,
        deviceIndexes: true,
        deviceAliasCode: false,
    });

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest();

        let ipLocal: string | null =
            req.socket?.remoteAddress || null;

        if (ipLocal?.startsWith('::ffff:')) {
            ipLocal = ipLocal.replace('::ffff:', '');
        }

        let ipPublic: string | null = null;

        const xff = req.headers['x-forwarded-for'];
        if (typeof xff === 'string') {
            ipPublic = xff.split(',')[0].trim();
        }

        if (!ipPublic || ipPublic.startsWith('192.168')) {
            try {
                const res = await axios.get(
                    'https://api.ipify.org?format=json',
                    { timeout: 3000 },
                );
                ipPublic = res.data?.ip ?? null;
            } catch {
                ipPublic = null;
            }
        }

        const userAgent = req.headers['user-agent'] || '';
        const result = this.detector.detect(userAgent);

        let location: any = null;

        if (ipPublic) {
            try {
                const res = await axios.get(
                    `http://ip-api.com/json/${ipPublic}`,
                    { timeout: 3000 },
                );

                if (res.data?.status === 'success') {
                    location = {
                        country: res.data.country,
                        countryCode: res.data.countryCode,
                        region: res.data.regionName,
                        city: res.data.city,
                        lat: res.data.lat,
                        lon: res.data.lon,
                        isp: res.data.isp,
                        org: res.data.org,
                    };
                }
            } catch {
                location = null;
            }
        }

        const clientInfo = {
            ipLocal,
            ipPublic,
            ipUsed: ipLocal,

            browser: {
                name: result.client?.name ?? 'unknown',
                version: result.client?.version ?? 'unknown',
                engine: result.client?.engine ?? 'unknown',
            },

            os: {
                name: result.os?.name ?? 'unknown',
                version: result.os?.version ?? 'unknown',
                platform: result.os?.platform ?? 'unknown',
            },

            device: {
                id: result.device?.id ?? null,
                type: result.device?.type ?? 'desktop',
                brand: result.device?.brand ?? null,
                model: result.device?.model ?? null,
                code: result.device?.code ?? null,
                trusted: result.device?.trusted ?? false,
                info: result.device?.info ?? {},
            },

            location,
        };

        // console.dir({ CLIENT_INFO: clientInfo }, { depth: null });

        req.clientInfo = clientInfo;

        if (!this.allowedIps.includes(ipLocal ?? '')) {
            throw new ForbiddenException(`IP ${ipLocal} is not allowed`);
        }

        return true;
    }
}
