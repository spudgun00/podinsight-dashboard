export interface TopicDataPoint {
  week: string;
  mentions: number;
  date: string;
}

export interface TopicVelocityData {
  data: {
    [topic: string]: TopicDataPoint[];
  };
  metadata: {
    total_episodes: number;
    date_range: string;
    data_completeness: string;
  };
}

export interface ChartDataPoint {
  week: string;
  [topic: string]: string | number;
}