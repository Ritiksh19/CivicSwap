import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from '../utils/axios';
import { useAuth } from '../context/AuthContext';

// Fix leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const categoryIcon = (cat) => {
  const icons = { Tools: '🔧', Books: '📚', Kitchenware: '🍳', Electronics: '💻', Sports: '⚽', Clothing: '👕', Other: '📦' };
  return icons[cat] || '📦';
};

const MapPage = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [radius, setRadius] = useState(5);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition((pos) => {
      setUserLocation({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      });
    });
  }, []);

  useEffect(() => {
    const fetchItems = async () => {
      if (!userLocation) return;
      setLoading(true);
      try {
        const { data } = await axios.get(
          `/items?latitude=${userLocation.lat}&longitude=${userLocation.lng}&radius=${radius}`
        );
        setItems(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [userLocation, radius]);

  const defaultCenter = userLocation
    ? [userLocation.lat, userLocation.lng]
    : [28.6139, 77.2090];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">

      {/* Controls Bar */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-0.5">Discover</p>
            <h1 className="text-2xl font-extrabold text-black tracking-tight">
              Items Near You
              <span className="ml-3 text-sm font-normal text-gray-400">
                {items.length} available within {radius}km
              </span>
            </h1>
          </div>

          {/* Radius Slider */}
          <div className="flex items-center gap-4 bg-gray-50 rounded-2xl px-5 py-3 border border-gray-100">
            <span className="text-sm font-semibold text-gray-600 whitespace-nowrap">Radius:</span>
            <input
              type="range"
              min="0.5"
              max="10"
              step="0.5"
              value={radius}
              onChange={(e) => setRadius(parseFloat(e.target.value))}
              className="w-32 accent-black"
            />
            <span className="text-sm font-bold text-black w-12">{radius} km</span>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-140px)]">

        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-gray-100 overflow-y-auto flex-shrink-0 hidden md:block">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-6 h-6 border-2 border-black/20 border-t-black rounded-full animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-4xl mb-3">📍</div>
              <p className="text-gray-400 text-sm">No items found in this area</p>
              <p className="text-gray-300 text-xs mt-1">Try increasing the radius</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {items.map((item, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedItem(item)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors duration-200 ${
                    selectedItem?._id === item._id ? 'bg-gray-50 border-l-2 border-black' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                      {categoryIcon(item.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-black truncate">{item.title}</p>
                      <p className="text-xs text-gray-400">{item.category} · {item.owner?.name}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold flex-shrink-0 ${
                      item.status === 'AVAILABLE' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {item.status === 'AVAILABLE' ? '✓' : '×'}
                    </span>
                  </div>
                  {selectedItem?._id === item._id && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-400 mb-2 line-clamp-2">{item.description}</p>
                      <Link
                        to={`/items/${item._id}`}
                        className="inline-flex items-center gap-1 bg-black text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-gray-800 transition-all duration-300"
                      >
                        View Item →
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          <MapContainer
            center={defaultCenter}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* User location circle */}
            {userLocation && (
              <>
                <Circle
                  center={[userLocation.lat, userLocation.lng]}
                  radius={radius * 1000}
                  pathOptions={{ color: 'black', fillColor: 'black', fillOpacity: 0.05, weight: 1 }}
                />
                <Marker position={[userLocation.lat, userLocation.lng]}>
                  <Popup>
                    <div className="text-center p-1">
                      <p className="font-bold text-sm">📍 You are here</p>
                    </div>
                  </Popup>
                </Marker>
              </>
            )}

            {/* Item markers */}
            {items.map((item, i) => (
              item.location?.coordinates && (
                <Marker
                  key={i}
                  position={[item.location.coordinates[1], item.location.coordinates[0]]}
                  eventHandlers={{ click: () => setSelectedItem(item) }}
                >
                  <Popup>
                    <div className="p-1 min-w-[160px]">
                      <div className="text-2xl text-center mb-2">{categoryIcon(item.category)}</div>
                      <p className="font-bold text-sm text-black">{item.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{item.category} · {item.owner?.name}</p>
                      <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full font-semibold ${
                        item.status === 'AVAILABLE' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {item.status}
                      </span>
                      <br />
                      <Link
                        to={`/items/${item._id}`}
                        className="inline-flex items-center gap-1 mt-2 bg-black text-white px-3 py-1 rounded-lg text-xs font-semibold hover:bg-gray-800 transition-all duration-300"
                      >
                        View Item →
                      </Link>
                    </div>
                  </Popup>
                </Marker>
              )
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default MapPage;