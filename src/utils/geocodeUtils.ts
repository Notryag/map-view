// 高德地图 Web服务 API 的地理编码接口
if (!process.env.NEXT_PUBLIC_AMAP_KEY) {
  console.warn('NEXT_PUBLIC_AMAP_KEY environment variable is not set');
}

const AMAP_KEY = process.env.NEXT_PUBLIC_AMAP_KEY;

export interface GeocodingResult {
  location: {
    lat: number;
    lng: number;
  };
  address: string;
  formatted_address: string;
}

interface AmapGeocode {
  location: string;
  formatted_address: string;
}

export async function searchAddress(address: string): Promise<GeocodingResult[]> {
  try {
    const response = await fetch(
      `https://restapi.amap.com/v3/geocode/geo?address=${encodeURIComponent(
        address
      )}&key=${AMAP_KEY}&output=JSON`
    );

    if (!response.ok) {
      throw new Error('地理编码请求失败');
    }

    const data = await response.json();
    
    if (data.status !== '1') {
      throw new Error(data.info || '地理编码失败');
    }

    return data.geocodes.map((item: AmapGeocode) => {
      const [lng, lat] = item.location.split(',').map(Number);
      return {
        location: { lat, lng },
        address: item.formatted_address,
        formatted_address: item.formatted_address,
      };
    });
  } catch (error) {
    console.error('地理编码错误:', error);
    throw error;
  }
}
