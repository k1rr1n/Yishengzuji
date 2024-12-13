import { invoke } from "@tauri-apps/api/core";

interface Options {
  map: mapboxgl.Map;
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

  constructor(options: Options) {
    this.map = options.map;
    this.init();
  }

  protected async init(): Promise<void> {
    await this.loadData();
    await this.loadLayers();
  }

  private async loadData() {
    const startTime = 0;
    const endTime = 180000000000;

    const res = await invoke("get_track_data", {
      startTime,
      endTime,
    });
    this.data = {
      type: "FeatureCollection",
      features: (res as any[]).map((p) => ({
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
  }

  private async loadLayers() {
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
      },
    });
    this.activeSources.add(sourceId);
    this.activeLayers.add(layerId);

    this.map.on("mouseenter", layerId, () => {
      this.map.getCanvas().style.cursor = "pointer";
    });

    this.map.on("mouseleave", layerId, () => {
      this.map.getCanvas().style.cursor = "";
    });

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
