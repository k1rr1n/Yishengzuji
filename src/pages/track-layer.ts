import { invoke } from "@tauri-apps/api/core";
import type { Point, TrackInfo } from "./type";
import mapboxgl from "mapbox-gl";

interface Options {
  map: mapboxgl.Map;
  onLoadingChange: (loading: boolean) => void;
  onInfoChange: (info: Partial<TrackInfo>) => void;
}

export type LayerInfo = {
  id: string;
  type: string;
  sourceId: string;
};

export class TrackLayer {
  private map: mapboxgl.Map;
  private data: any;
  private activeSources: Set<string> = new Set();
  private activeLayers: Set<string> = new Set();
  private onLoadingChange: (loading: boolean) => void;
  private onInfoChange: (info: Partial<TrackInfo>) => void;

  constructor(options: Options) {
    this.map = options.map;
    this.onLoadingChange = options.onLoadingChange;
    this.onInfoChange = options.onInfoChange;
    this.init();
  }

  protected async init(): Promise<void> {
    this.onLoadingChange(true);
    await this.loadData();
  }

  public async loadData(startTime: number = 0, endTime: number = 1800000000) {
    const res = await invoke("get_track_data", {
      startTime,
      endTime,
    });

    this.onInfoChange({
      count: (res as Point[]).length,
    });

    this.data = {
      type: "FeatureCollection",
      features: (res as Point[]).map((p) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [p.longitude, p.latitude],
        },
        properties: {
          ...p,
        },
      })),
    };

    await Promise.all([
      this.loadLayers(),
      this.getTotalDistance(startTime, endTime),
    ]);
  }

  private async loadLayers() {
    this.destroy();

    const sourceId = "track-data-source";
    const layerId = "track-data-layer";

    this.map.addSource(sourceId, {
      type: "geojson",
      data: this.data,
    });
    this.map.addLayer({
      id: layerId,
      type: "circle",
      source: sourceId,
      paint: {
        "circle-radius": 3,
        "circle-color": "#ff8c00",
        "circle-opacity": 0.8,
        'circle-emissive-strength': 1,
      },
    });

    // 自动缩放定位
    const bounds = new mapboxgl.LngLatBounds();
    this.data.features.forEach((f: any) => {
      bounds.extend(f.geometry.coordinates);
    });
    this.map.fitBounds(bounds, {
      padding: 10,
      maxZoom: 18,
      pitch: 30 + Math.random() * 30,
      bearing: Math.random() * 90 - 45,
      duration: 2000,
    });

    this.activeSources.add(sourceId);
    this.activeLayers.add(layerId);

    this.map.on("mouseenter", layerId, () => {
      this.map.getCanvas().style.cursor = "pointer";
    });

    this.map.on("mouseleave", layerId, () => {
      this.map.getCanvas().style.cursor = "";
    });

    this.onLoadingChange(false);

    // this.map.on("click", layerId, (e) => {
    //   if (!e.features || !e.features[0]) return;
    //   const properties = e.features[0].properties;
    //   const coord = e.features[0].geometry.coordinates.slice() as [number, number]

    //   new mapboxgl.Popup()
    //     .setLngLat(coord)
    //     .setHTML(`

    //       `)
    // });
  }

  private async getTotalDistance(startTime: number, endTime: number) {
    const res = await invoke("get_total_distance", {
      startTime,
      endTime,
    });

    this.onInfoChange({
      totalDistance: Number(((res as number) / 1000).toFixed(2)),
    });
  }

  public getLayersInfo(): LayerInfo[] {
    return Array.from(this.activeLayers).map((layeId) => ({
      id: layeId,
      type: this.map.getLayer(layeId)?.type || "unknown",
      sourceId: "track-data-source",
    }));
  }

  public async destroy(): Promise<void> {
    for (const layerId of this.activeLayers) {
      if (this.map.getLayer(layerId)) {
        this.map.removeLayer(layerId);
      }
    }
    this.activeLayers.clear();

    for (const sourceId of this.activeSources) {
      if (this.map.getSource(sourceId)) {
        this.map.removeSource(sourceId);
      }
    }
    this.activeSources.clear();
  }
}
