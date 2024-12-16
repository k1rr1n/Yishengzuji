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

interface CityStats {
  city_name: string;
  province_name: string;
  first_visit_time: number;
  last_visit_time: number;
  total_points: number;
  visit_days: number;
  avg_altitude: number;
  avg_speed: number;
  visit_order: number;
  frequency_rank: number;
}

interface DailyStats {
  day_type: string;
  city_name: string;
  province_name: string;
  total_points: number;
  days_count: number;
  avg_speed: number;
  avg_altitude: number;
  total_distance: number;
  distance_per_day: number;
  activity_rank: number;
}

export type { Point, TrackInfo, CityStats, DailyStats };
