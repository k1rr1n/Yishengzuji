type Point = Record<
  | "id"
  | "data_time"
  | "loc_type"
  | "longitude"
  | "latitude"
  | "heading"
  | "accuracy"
  | "speed"
  | "distance",
  number
>;

interface TrackInfo {
  totalDistance: number;
  count: number;
  currentPoint: Point;
}

export type { Point, TrackInfo };
