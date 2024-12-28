'use client';
import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// 修复 Leaflet 默认图标问题
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface MapProps {
  position: [number, number];
  onLocationSelect?: (lat: number, lng: number) => void;
}

interface LeafletContainer extends Element {
  __leaflet_map?: L.Map;
}

// 自定义组件来更新地图中心
function UpdateMapCenter({ position }: MapProps) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(position, map.getZoom());
  }, [position, map]);

  return null;
}

// 地图点击事件处理组件
function MapClickHandler({ onLocationSelect }: { onLocationSelect?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      if (onLocationSelect) {
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      }
    },
  });

  return null;
}

export default function MapComponent({ position, onLocationSelect }: MapProps) {
  return (
    <MapContainer
      center={position}
      zoom={13}
      className="w-full h-full rounded-lg shadow-inner"
      zoomControl={false} // 禁用默认缩放控件
      style={{ height: '100%', width: '100%' }}
      dragging={true}
      touchZoom={true}
      scrollWheelZoom={true}
      doubleClickZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://amap.com">高德地图</a>'
        url="https://wprd0{s}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=1&style=7"
        subdomains={['1', '2', '3', '4']}
      />
      <Marker 
        position={position} 
        icon={icon}
      >
        <Popup>
          <div className="text-sm">
            经度: {position[1].toFixed(6)}<br />
            纬度: {position[0].toFixed(6)}
          </div>
        </Popup>
      </Marker>
      <UpdateMapCenter position={position} />
      <MapClickHandler onLocationSelect={onLocationSelect} />

      {/* 添加缩放控件到右下角 */}
      <div className="leaflet-bottom leaflet-right">
        <div className="leaflet-control-zoom leaflet-bar leaflet-control">
          <a 
            className="leaflet-control-zoom-in" 
            href="#" 
            title="放大"
            role="button"
            aria-label="放大"
            aria-disabled="false"
            onClick={(e) => {
              e.preventDefault();
              const map = (document.querySelector('.leaflet-container') as LeafletContainer)?.__leaflet_map;
              if (map) map.zoomIn();
            }}
          >+</a>
          <a 
            className="leaflet-control-zoom-out" 
            href="#" 
            title="缩小"
            role="button"
            aria-label="缩小"
            aria-disabled="false"
            onClick={(e) => {
              e.preventDefault();
              const map = (document.querySelector('.leaflet-container') as LeafletContainer)?.__leaflet_map;
              if (map) map.zoomOut();
            }}
          >-</a>
        </div>
      </div>
    </MapContainer>
  );
}
