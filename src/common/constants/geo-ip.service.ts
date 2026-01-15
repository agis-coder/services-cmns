// geo-ip.service.ts
import axios from 'axios';

export async function getGeoByIp(ip: string) {
    try {
        const res = await axios.get(`http://ip-api.com/json/${ip}`, {
            timeout: 3000,
        });

        if (res.data?.status !== 'success') return null;

        return {
            country: res.data.country,
            city: res.data.city,
            region: res.data.regionName,
            lat: res.data.lat,
            lon: res.data.lon,
            isp: res.data.isp,
        };
    } catch {
        return null;
    }
}
