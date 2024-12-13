import { useEffect, useRef, useState } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import mapboxgl from "mapbox-gl";
import { TrackLayer } from "./track-layer";

const MapView: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const trackLayer = useRef<TrackLayer | null>(null);
  const [data, setData] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!mapContainer.current) return;

    const initMap = async () => {
      mapboxgl.accessToken =
        "pk.eyJ1Ijoic3lhMDcyNCIsImEiOiJjbHpsY3hlbHUwMWxiMmpxcnNqaWJsb3gxIn0.oklNauuQwt0D1iXPtfH0JA";

      map.current = new mapboxgl.Map({
        container: mapContainer.current!,
        style: "mapbox://styles/mapbox/dark-v11",
        center: [116, 39.5],
        zoom: 11,
      });

      await new Promise<void>((resolve) => {
        map.current!.once("load", () => resolve());
      });
      trackLayer.current = new TrackLayer({ map: map.current });
      setIsLoading(false);
    };

    initMap();

    return () => {
      trackLayer.current?.destroy();
      trackLayer.current = null;
      if (map.current) map.current.getCanvas().style.cursor = "";
      map.current?.remove();
      map.current = null;
    };
  }, []);

  return (
    <div className="relative w-[100vw] h-[100vh]">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
        </div>
      )}

      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
};

export default MapView;
