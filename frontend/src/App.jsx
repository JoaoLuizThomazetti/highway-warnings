import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';


function ClickableMap({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null;
}


function App() {

  const [popupInfo, setPopupInfo] = useState(null);
  const [popupText, setPopupText] = useState('');
  const [savedInfos, setSavedInfos] = useState([]);
  const markerRef = useRef(null);
  const messageCountRef = useRef(0);

  useEffect(() => {
    if (popupInfo && markerRef.current) {
      setTimeout(() => {
        markerRef.current.openPopup();
      }, 100);
    }
  }, [popupInfo]);


  const handleMapClick = async (latlng) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(
        `${apiUrl}/api/nearest_state_highway?lat=${latlng.lat}&lng=${latlng.lng}`
      );
      if (!response.ok) {
        throw new Error("API request failed");
      }
      const data = await response.json();
      setPopupInfo({ ...latlng, highway: data.highway, name: data.name });
      setPopupText('');
    } catch (error) {
      console.error("Error fetching highway data:", error);
    }
  };

  const handleButtonClick = () => {
    messageCountRef.current += 1;
    const newInfo = {
      ID: messageCountRef.current,
      Code: popupInfo.highway,
      Name: popupInfo.name,
      Latitude: popupInfo.lat,
      Longitude: popupInfo.lng,
      Message: popupText,
    };
    setSavedInfos((prev) => [...prev, newInfo]);
    if (markerRef.current) {
      markerRef.current.closePopup();
    }
  };

  const removeCard = (ID) => {
    setSavedInfos((prev) => prev.filter((info) => info.ID !== ID));
  };

  return (
    <div>
      <div
        style={{
          fontSize: 11,
          textAlign: 'center',
          padding: '10px 0',
          borderBottom: '2px solid #ccc',
        }}
      >
        <h1 style={{ margin: 0 }}>Highway warnings - SC</h1>
      </div>
      <div style={{ display: 'flex', height: '100vh' }}>
        <div style={{ flex: 1 }}>
          <MapContainer
            center={[-27.5, -51.0]}
            zoom={7.5}
            style={{ height: "100vh", width: "150vh" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="© OpenStreetMap contributors"
            />
            <ClickableMap onMapClick={handleMapClick} />
            {popupInfo && (
              <Marker position={[popupInfo.lat, popupInfo.lng]} ref={markerRef}>
                <Popup>
                <div>
                    <p>
                      <strong>NEAREST HIGHWAY</strong><br /><br />
                      <strong>Code:</strong> {popupInfo.highway}<br />
                      <strong>Name:</strong> {popupInfo.name}<br />
                      <strong>coord:</strong> {Number(popupInfo.lat.toFixed(4))} {Number(popupInfo.lng.toFixed(4))}<br />
                    </p>
                    <strong>MESSAGE: </strong>
                    <input
                      type="text"
                      placeholder=""
                      value={popupText}
                      onChange={(e) => setPopupText(e.target.value)}
                    />
                    <br /><br />
                    <button onClick={handleButtonClick}>
                      SAVE
                    </button>
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </div>
        <div style={{
          width: '23%',
          borderLeft: '2px solid #ccc',
          padding: '10px',
          overflowY: 'auto',
        }}>
          <h3 style={{ margin: 5 }}>REGISTERED WARNINGS</h3>
          <hr></hr>
          {savedInfos.map(info => (
            <div key={info.ID} style={{
              border: '1px solid #ddd',
              padding: '10px',
              marginBottom: '10px',
              borderRadius: '4px',
              position: 'relative',
              lineHeight: '1.2'
            }}>
              <button
                onClick={() => removeCard(info.ID)}
                style={{
                  position: 'absolute',
                  top: '5px',
                  right: '5px',
                  border: 'none',
                  background: 'transparent',
                  color: 'red',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                X
              </button>
              <p style={{ margin: 1 }}><strong>ID: {info.ID}</strong></p>
              <p style={{ margin: 1 }}><strong>Code:</strong> {info.Code}</p>
              <p style={{ margin: 1 }}><strong>Name:</strong> {info.Name}</p>
              <p style={{ margin: 1 }}><strong>Latitude:</strong> {info.Latitude}</p>
              <p style={{ margin: 1 }}><strong>Longitude:</strong> {info.Longitude}</p>
              <p style={{ margin_top: 1}}><strong>MESSAGE:</strong> {info.Message}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;