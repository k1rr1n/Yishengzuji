import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxLanguage from "@mapbox/mapbox-gl-language";
import dayjs from "dayjs";
import Datepicker from "react-tailwindcss-datepicker";
import CountUp from "react-countup";
import { TrackLayer } from "./track-layer";
import type { CityStats, DailyStats, TrackInfo } from "./type";
import "mapbox-gl/dist/mapbox-gl.css";
import Modal from "./modal";
import { token } from "../../env";

const accessToken = token;

const MapView: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const trackLayer = useRef<TrackLayer | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [date, setDate] = useState({
    startDate: 0,
    endDate: 1800000000,
  });
  const [info, setInfo] = useState<Partial<TrackInfo>>({
    totalDistance: 0,
    count: 0,
    currentPoint: undefined,
  });
  const [analysis, setAnalysis] = useState<{
    isModalOpen: boolean;
    cityStats: CityStats[];
    dailyStats: DailyStats[];
  }>({
    isModalOpen: false,
    cityStats: [],
    dailyStats: [],
  });

  const handleSearch = async () => {
    if (!date.startDate || !date.endDate) {
      return;
    }
    setIsLoading(true);
    try {
      const startTime = dayjs(date.startDate).unix();
      const endTime = dayjs(date.endDate).unix();
      await trackLayer.current?.destroy();
      await trackLayer.current?.loadData(startTime, endTime);
    } catch (error) {
      console.error("加载数据失败:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalysis = async () => {
    await trackLayer.current?.analyze();
  };

  useEffect(() => {
    if (!mapContainer.current) return;

    const initMap = async () => {
      map.current = new mapboxgl.Map({
        container: mapContainer.current!,
        style: "mapbox://styles/mapbox/dark-v11",
        center: [116, 39.5],
        accessToken,
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
        map.current!.once("load", () => {
          console.log("map loaded successfully");
          resolve();
        });
      });

      // map.current!.setConfigProperty("basemap", "lightPreset", "night");
      // map.current!.setConfigProperty("basemap", "show3dObjects", true);

      trackLayer.current = new TrackLayer({
        map: map.current,
        onLoadingChange: setIsLoading,
        onInfoChange: (info) => {
          setInfo((prev) => ({
            ...prev,
            ...info,
          }));
        },
        onModalChange: (open: any, cityStats: any, dailyStats: any) => {
          setAnalysis((prev) => ({
            ...prev,
            isModalOpen: open,
            cityStats: cityStats || prev.cityStats,
            dailyStats: dailyStats || prev.dailyStats,
          }));
        },
      });
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
    handleSearch();
  }, [date]);

  return (
    <div className="relative w-[100vw] h-[100vh]">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-50" />
        </div>
      )}

      {/* date picker */}
      <div className="fixed z-50 left-4 bottom-40">
        <Datepicker
          value={date as any}
          onChange={(newDate) => setDate(newDate as any)}
          showShortcuts={true}
          placeholder="定义一段时光"
          required
          configs={{
            shortcuts: {
              today: "今日",
              yesterday: "昨日",
              past: (period) => "过去 " + period + " 日",
            },
          }}
        />
      </div>

      {/* count */}
      <div className="fixed z-50 left-4 bottom-10 bg-gray-800/70 backdrop-blur-sm p-3 rounded-lg">
        <p className="text-gray-950 dark:text-gray-50 tracking-wide">
          这段时光里，
          <br />「 Through Life 」 为我记录了
          <span className="px-2 text-md font-bold text-orange-600">
            {info.count ? (
              <CountUp
                end={info.count}
                decimals={0}
                duration={1.5}
                separator=","
              />
            ) : (
              <CountUp
                end={99999}
                decimals={0}
                duration={100}
                separator=","
                delay={0}
                useEasing={false}
                onEnd={() => info.count}
              />
            )}
          </span>
          个轨迹点，
          <br />
          陪我走过
          <span className="px-2 text-md font-bold text-orange-600">
            {info.totalDistance ? (
              <CountUp
                end={info.totalDistance}
                decimals={2}
                duration={1.5}
                separator=","
              />
            ) : (
              <CountUp
                end={9999.99}
                decimals={2}
                duration={100}
                separator=","
                delay={0}
                useEasing={false}
                onEnd={() => info.totalDistance}
              />
            )}
          </span>
          千米
        </p>
      </div>

      {/* analysis button */}
      <button
        onClick={handleAnalysis}
        disabled={isLoading}
        className={`fixed z-50 left-72 bottom-40 rounded-lg px-3 py-2 text-gray-50 shadow-lg transform transition-all duration-150 ${
          isLoading
            ? "bg-orange-600/60 cursor-not-allowed opacity-50"
            : "bg-orange-600 hover:scale-105 active:scale-100"
        }`}
      >
        <div>时光便签</div>
      </button>

      {/* analysis modal */}
      <Modal
        isOpen={analysis.isModalOpen}
        onClose={() => setAnalysis((prev) => ({ ...prev, isModalOpen: false }))}
        cityData={analysis.cityStats}
        dailyData={analysis.dailyStats}
      />

      {/* map */}
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
};

export default MapView;
