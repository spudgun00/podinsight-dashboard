"use client";

import React, { useEffect, useState } from "react";
import { X, Mail, Share2, Download, ChevronRight, Clock, Mic, TrendingUp } from "lucide-react";
import { APIEpisode, TopItem } from "@/types/intelligence";
import { fetchEpisodeBrief, shareEpisodeIntelligence } from "@/hooks/useIntelligenceDashboard";

interface IntelligenceBriefModalProps {
  isOpen: boolean;
  onClose: () => void;
  episodeId?: string;
  initialData?: TopItem;
}

export const IntelligenceBriefModal: React.FC<IntelligenceBriefModalProps> = ({
  isOpen,
  onClose,
  episodeId,
  initialData
}) => {
  const [episode, setEpisode] = useState<APIEpisode | null>(null);
  const [loading, setLoading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && episodeId) {
      setLoading(true);
      fetchEpisodeBrief(episodeId)
        .then(setEpisode)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isOpen, episodeId]);

  const handleShare = async (method: 'email' | 'slack') => {
    if (!episode) return;
    
    setSharing(true);
    try {
      await shareEpisodeIntelligence({
        episode_id: episode.episode_id,
        method,
        recipient: method === 'email' ? 'user@example.com' : '#general',
        include_summary: true,
        personal_note: 'Check out this intelligence from PodInsightHQ'
      });
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to share:', error);
    } finally {
      setSharing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden bg-[#1A1A1C] rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#1A1A1C]/95 backdrop-blur-md border-b border-gray-800">
          <div className="p-6 flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2">
                {loading ? "Loading..." : episode?.title || initialData?.title || "Intelligence Brief"}
              </h2>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                {episode && (
                  <>
                    <span className="flex items-center gap-1">
                      <Mic className="w-4 h-4" />
                      {episode.podcast_name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {Math.floor(episode.duration_seconds / 60)} min
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      {(episode.relevance_score * 100).toFixed(0)}% relevance
                    </span>
                  </>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="p-6 space-y-6">
            {/* Summary Section */}
            {episode?.summary && (
              <div className="bg-gray-900/50 rounded-xl p-5 border border-gray-800">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  Episode Summary
                </h3>
                <p className="text-gray-300 leading-relaxed">{episode.summary}</p>
              </div>
            )}

            {/* Key Insights */}
            {episode?.key_insights && episode.key_insights.length > 0 && (
              <div className="bg-gray-900/50 rounded-xl p-5 border border-gray-800">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Key Insights
                </h3>
                <ul className="space-y-2">
                  {episode.key_insights.map((insight, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-gray-300">
                      <ChevronRight className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Signals */}
            {episode?.signals && episode.signals.length > 0 && (
              <div className="bg-gray-900/50 rounded-xl p-5 border border-gray-800">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Intelligence Signals
                </h3>
                <div className="space-y-3">
                  {episode.signals.map((signal, idx) => (
                    <div key={idx} className="p-3 bg-gray-800/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-purple-400 uppercase tracking-wider">
                          {signal.type.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-gray-500">
                          {(signal.confidence * 100).toFixed(0)}% confidence
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm">{signal.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-[#1A1A1C]/95 backdrop-blur-md border-t border-gray-800 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {shareSuccess && (
                <span className="text-sm text-green-400 animate-fade-in">
                  Successfully shared!
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleShare('email')}
                disabled={sharing || !episode}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                <Mail className="w-4 h-4" />
                Email Brief
              </button>
              <button
                onClick={() => handleShare('slack')}
                disabled={sharing || !episode}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Share to Slack
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};