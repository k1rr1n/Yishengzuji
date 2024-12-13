import { useEffect, useRef, useState } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import mapboxgl from "mapbox-gl";
import MapboxLanguage from "@mapbox/mapbox-gl-language";
import { TrackLayer } from "./track-layer";
import dayjs from "dayjs";
import Datepicker from "react-tailwindcss-datepicker";

const MapView: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const trackLayer = useRef<TrackLayer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [date, setDate] = useState({
    startDate: null,
    endDate: null,
  });

  useEffect(() => {
    if (!mapContainer.current) return;

    const initMap = async () => {
      mapboxgl.accessToken =
        "pk.eyJ1Ijoic3lhMDcyNCIsImEiOiJjbHpsY3hlbHUwMWxiMmpxcnNqaWJsb3gxIn0.oklNauuQwt0D1iXPtfH0JA";

      map.current = new mapboxgl.Map({
        container: mapContainer.current!,
        style: "mapbox://styles/mapbox/dark-v11",
        center: [116, 39.5],
        zoom: 7,
      });

      map.current.addControl(
        new MapboxLanguage({
          defaultLanguage: "zh-Hans",
        })
      );
      map.current.addControl(new mapboxgl.NavigationControl(), "bottom-right");
      map.current.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true,
          },
          trackUserLocation: true,
          showUserHeading: true,
        }),
        "bottom-right"
      );

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

  useEffect(() => {
    const handleSearch = async () => {
      if (!date.startDate || !date.endDate) {
        return;
      }

      setIsLoading(true);
      try {
        const startTime = dayjs(date.startDate).unix();
        const endTime = dayjs(date.endDate).unix();

        await trackLayer.current?.loadData(startTime, endTime);
      } catch (error) {
        console.error("加载数据失败:", error);
      } finally {
        setIsLoading(false);
      }
    };

    handleSearch();
  }, [date]);

  return (
    <div className="relative w-[100vw] h-[100vh]">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
        </div>
      )}

      <div className="fixed z-50 left-4 bottom-16 w-200">
        <Datepicker
          value={date}
          onChange={(newDate) => setDate(newDate as any)}
          showShortcuts={true}
          placeholder="自定义查看足迹👣"
          required
          i18n="cn"
          configs={{
            shortcuts: {
              today: "今日",
              yesterday: "昨日",
              past: (period) => "过去 " + period + " 日",
              currentMonth: "本月",
              pastMonth: "上月",
            },
          }}
        />
      </div>

      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
};

export default MapView;
