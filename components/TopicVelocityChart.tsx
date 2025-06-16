"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import LoadingSkeleton from "./LoadingSkeleton";
import { fetchTopicVelocity } from "@/lib/api";
import { TOPIC_COLORS, DEFAULT_TOPICS } from "@/lib/utils";
import { TopicVelocityData, ChartDataPoint } from "@/types/analytics";

export default function TopicVelocityChart() {
  const [data, setData] = useState<TopicVelocityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const result = await fetchTopicVelocity(12, DEFAULT_TOPICS);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) return <LoadingSkeleton />;
  
  if (error) {
    return (
      <div className="w-full p-6 bg-red-900/20 backdrop-blur-md rounded-lg border border-red-800">
        <p className="text-red-400">Error loading data: {error}</p>
      </div>
    );
  }

  if (!data) return null;

  // Transform data for Recharts
  const chartData = transformDataForChart(data.data);

  return (
    <div className="w-full p-6 bg-gray-900/50 backdrop-blur-md rounded-lg border border-gray-800">
      <h2 className="text-2xl font-bold mb-6">Topic Velocity Tracker</h2>
      
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="week" 
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF' }}
          />
          <YAxis 
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF' }}
            label={{ value: 'Mentions', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1F2937', 
              border: '1px solid #374151',
              borderRadius: '0.375rem'
            }}
            labelStyle={{ color: '#F3F4F6' }}
            itemStyle={{ color: '#F3F4F6' }}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="line"
          />
          {DEFAULT_TOPICS.map((topic) => (
            <Line
              key={topic}
              type="monotone"
              dataKey={topic}
              stroke={TOPIC_COLORS[topic as keyof typeof TOPIC_COLORS]}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      
      <div className="mt-4 text-sm text-gray-400">
        <p>Total Episodes: {data.metadata.total_episodes}</p>
        <p>Date Range: {data.metadata.date_range}</p>
      </div>
    </div>
  );
}

function transformDataForChart(apiData: TopicVelocityData["data"]): ChartDataPoint[] {
  const weeks = new Set<string>();
  const topics = Object.keys(apiData);
  
  // Collect all unique weeks
  topics.forEach(topic => {
    apiData[topic].forEach(point => weeks.add(point.week));
  });
  
  // Create chart data with all topics for each week
  return Array.from(weeks).sort().map(week => {
    const point: ChartDataPoint = { week };
    topics.forEach(topic => {
      const topicData = apiData[topic].find(d => d.week === week);
      point[topic] = topicData ? topicData.mentions : 0;
    });
    return point;
  });
}