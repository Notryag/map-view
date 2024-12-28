'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Coordinate, CoordinateSystem, coordinateSystems, transformCoordinate } from '@/utils/coordinateUtils';
import { searchAddress } from '@/utils/geocodeUtils';

const MapComponent = dynamic(() => import('@/components/Map'), {
  ssr: false,
});

export default function Home() {
  const [coordinate, setCoordinate] = useState<Coordinate>({ lat: 39.9042, lng: 116.4074 });
  const [selectedSystem, setSelectedSystem] = useState<CoordinateSystem>('WGS84');
  const [inputCoordinate, setInputCoordinate] = useState('116.4074, 39.9042');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleCoordinateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const coords = inputCoordinate.split(',').map(coord => parseFloat(coord.trim()));
      if (coords.length === 2 && !coords.some(isNaN)) {
        const wgs84Coord = transformCoordinate(
          { lng: coords[0], lat: coords[1] },
          selectedSystem,
          'WGS84'
        );
        setCoordinate(wgs84Coord);
      } else {
        alert('请输入正确的坐标格式，例如：116.4074, 39.9042');
      }
    } catch (error) {
      console.error('坐标转换错误:', error);
      alert('坐标转换出错，请检查输入格式是否正确');
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await searchAddress(searchQuery);
      if (results.length > 0) {
        const { location } = results[0];
        // 高德地图返回的是GCJ02坐标系
        const wgs84Coord = transformCoordinate(location, 'GCJ02', 'WGS84');
        setCoordinate(wgs84Coord);
        
        // 更新输入框显示的坐标（转换为当前选择的坐标系）
        const displayCoord = transformCoordinate(wgs84Coord, 'WGS84', selectedSystem);
        setInputCoordinate(`${displayCoord.lng.toFixed(6)}, ${displayCoord.lat.toFixed(6)}`);
      } else {
        alert('未找到该地址，请尝试其他关键词');
      }
    } catch (error) {
      console.error('搜索错误:', error);
      alert('搜索失败，请稍后重试');
    } finally {
      setIsSearching(false);
    }
  };

  const getCoordinateInSystem = (system: CoordinateSystem) => {
    try {
      const transformed = transformCoordinate(coordinate, 'WGS84', system);
      return `${transformed.lng.toFixed(6)}, ${transformed.lat.toFixed(6)}`;
    } catch (error) {
      console.error('坐标转换错误:', error);
      return '转换错误';
    }
  };

  const getMapPosition = (): [number, number] => {
    try {
      const gcj02Coord = transformCoordinate(coordinate, 'WGS84', 'GCJ02');
      console.log('GCJ02 坐标:', gcj02Coord);
      return [gcj02Coord.lat, gcj02Coord.lng] as [number, number];
    } catch (error) {
      console.error('坐标转换错误:', error);
      return [coordinate.lat, coordinate.lng] as [number, number];
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    try {
      // 将 GCJ02 坐标转换为当前选择的坐标系
      const gcj02Coord = { lat, lng };
      const wgs84Coord = transformCoordinate(gcj02Coord, 'GCJ02', 'WGS84');
      const targetCoord = transformCoordinate(wgs84Coord, 'WGS84', selectedSystem);
      
      // 更新状态
      setCoordinate(wgs84Coord);
      setInputCoordinate(`${targetCoord.lng.toFixed(6)}, ${targetCoord.lat.toFixed(6)}`);
    } catch (error) {
      console.error('坐标转换错误:', error);
      alert('坐标转换出错');
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="relative">
        {/* 装饰背景 */}
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white/50 to-purple-50/50 -z-10"></div>

        {/* 主要内容 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              坐标系转换地图
            </h1>
            <p className="text-lg text-gray-600">
              支持 WGS84、GCJ02、BD09 坐标系互转，点击地图或输入坐标
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-100">
              {/* 地址搜索表单 */}
              <form onSubmit={handleSearch} className="mb-8">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜索地址..."
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  />
                  <button
                    type="submit"
                    disabled={isSearching}
                    className="absolute right-2 top-2 px-4 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50"
                  >
                    {isSearching ? '搜索中...' : '搜索'}
                  </button>
                </div>
              </form>

              <form onSubmit={handleCoordinateSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    坐标系统
                  </label>
                  <select
                    value={selectedSystem}
                    onChange={(e) => setSelectedSystem(e.target.value as CoordinateSystem)}
                    className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  >
                    {coordinateSystems.map(system => (
                      <option key={system} value={system}>{system}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    坐标 (经度, 纬度)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={inputCoordinate}
                      onChange={(e) => setInputCoordinate(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      placeholder="例如：116.4074, 39.9042"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-400 text-sm">lng, lat</span>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    请按照"经度, 纬度"的格式输入坐标，或直接点击地图选择位置
                  </p>
                </div>
                
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-[1.02]"
                >
                  更新坐标
                </button>
              </form>

              <div className="mt-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  不同坐标系下的坐标值
                </h2>
                <div className="space-y-3">
                  {coordinateSystems.map(system => (
                    <div
                      key={system}
                      className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <span className="font-medium text-gray-700">{system}:</span>
                      <span className="ml-2 text-gray-600 font-mono">
                        {getCoordinateInSystem(system)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              <div className="h-[600px] sm:h-[700px] lg:h-[800px]">
                <MapComponent 
                  position={getMapPosition()} 
                  onLocationSelect={handleMapClick}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
