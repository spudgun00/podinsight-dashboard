// API Response Types
export interface APISignal {
  type: 'investable' | 'competitive' | 'portfolio' | 'sound_bite';
  content: string;
  confidence: number;
  timestamp?: number | null;
}

export interface APIEpisode {
  episode_id: string;
  title: string;
  podcast_name: string;
  published_at: string;
  duration_seconds: number;
  relevance_score: number;
  signals: APISignal[];
  summary: string;
  key_insights: string[];
  audio_url?: string | null;
}

export interface APIDashboardResponse {
  episodes: APIEpisode[];
  total_episodes: number;
  generated_at: string;
}

// UI Types (matches existing component structure)
export type UrgencyLevel = "critical" | "high" | "normal";

export interface TopItem {
  id: string;
  title: string;
  description: string;
  urgency: UrgencyLevel;
  metadata?: {
    source?: string;
    value?: string;
    change?: string;
  };
  episodeId?: string; // For linking to full brief
  signalType?: APISignal['type'];
}

export interface TimeSensitiveData {
  deadline?: Date;
  daysRemaining?: number;
  isExpiring?: boolean;
}

export interface IntelligenceCard {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  action: string;
  onClick: () => void;
  topItems: TopItem[];
  urgency: UrgencyLevel;
  timeSensitive?: TimeSensitiveData;
  lastUpdated: Date;
  totalCount: number;
  iconStyles: {
    background: string;
    border: string;
    hoverBackground: string;
    glow: string;
  };
}

// Share Request Types
export interface ShareRequest {
  episode_id: string;
  method: 'email' | 'slack';
  recipient: string;
  include_summary: boolean;
  personal_note?: string;
}

export interface ShareResponse {
  success: boolean;
  message: string;
  shared_at: string;
}

// Preferences Types
export interface UserPreferences {
  portfolio_companies: string[];
  interest_topics: string[];
  notification_frequency: 'daily' | 'weekly' | 'monthly';
  email_notifications: boolean;
  slack_notifications: boolean;
}