import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';

const createMarkerIcon = (color) =>
  new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

export default function ParkingMap({ parkings, onSelectParking }) {
  const center = [17.385, 78.4867];

  return (
    <div className="map-panel">
      <MapContainer center={center} zoom={11} scrollWheelZoom className="leaflet-map">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {parkings.map((parking) => (
          <Marker
            key={parking._id}
            position={[parking.latitude, parking.longitude]}
            icon={parking.availableSlots > 0 ? createMarkerIcon('green') : createMarkerIcon('red')}
          >
            <Popup>
              <div className="map-popup">
                <strong>{parking.name}</strong>
                <p>{parking.address}</p>
                <p>{parking.vehicleType || 'Car'} · {parking.availableSlots} / {parking.totalSlots} slots available</p>
                <p>Approx. {parking.distance || '2.5'} km from city center</p>
                <button
                  className="btn btn-primary btn-small"
                  onClick={() => onSelectParking(parking)}
                  type="button"
                >
                  Reserve this spot
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
