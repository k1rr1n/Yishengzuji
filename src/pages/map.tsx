import { useState } from "react";
import Map from "react-map-gl";
import DeckGL from "@deck.gl/react";
import { ScatterplotLayer } from "@deck.gl/layers";
import "mapbox-gl/dist/mapbox-gl.css";

const initial_view_state = {
  longitude: 116,
  latitude: 39.5,
  zoom: 11,
  pitch: 0,
  bearing: 0,
};

const MapView: React.FC = () => {
  const [mapViewState, setMapViewState] = useState(initial_view_state);

  const layers = [
    new ScatterplotLayer({
      id: "scatter",
      data: [],
      getPosition: (d) => d.coordinates,
      getFillColor: [255, 0, 0],
      getRadius: 100,
      opacity: 0.3,
    }),
  ];

  return (
    <div className="relative w-[100vw] h-[100vh]">
      <DeckGL
        initialViewState={initial_view_state}
        controller={true}
        layers={layers}
      >
        <Map
          mapboxAccessToken="pk.eyJ1Ijoic3lhMDcyNCIsImEiOiJjbHpsY3hlbHUwMWxiMmpxcnNqaWJsb3gxIn0.oklNauuQwt0D1iXPtfH0JA"
          mapStyle="mapbox://styles/mapbox/dark-v11"
          onMove={(e) => setMapViewState(e.viewState)}
        >
        </Map>
      </DeckGL>
    </div>
  );
};

export default MapView;
