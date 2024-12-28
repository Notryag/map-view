import gcoord from 'gcoord';

// 定义常用的坐标系
const projections = {
  'WGS84': '+proj=longlat +datum=WGS84 +no_defs',
  'GCJ02': '+proj=longlat +datum=GCJ02',
  'BD09': '+proj=longlat +datum=BD09',
};

export interface Coordinate {
  lat: number;
  lng: number;
}

export type CoordinateSystem = keyof typeof projections;

const COORD_SYSTEM_MAP = {
  'WGS84': gcoord.WGS84,
  'GCJ02': gcoord.GCJ02,
  'BD09': gcoord.BD09
};

export function transformCoordinate(
  coord: Coordinate,
  fromSystem: CoordinateSystem,
  toSystem: CoordinateSystem
): Coordinate {
  if (fromSystem === toSystem) {
    return coord;
  }

  try {
    const result = gcoord.transform(
      [coord.lng, coord.lat],
      COORD_SYSTEM_MAP[fromSystem],
      COORD_SYSTEM_MAP[toSystem]
    );

    return {
      lng: result[0],
      lat: result[1]
    };
  } catch (error) {
    console.error('坐标转换错误:', error);
    throw new Error(`坐标转换失败: ${fromSystem} 到 ${toSystem}`);
  }
}

export const coordinateSystems: CoordinateSystem[] = ['WGS84', 'GCJ02', 'BD09'];
