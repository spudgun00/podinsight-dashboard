import { ActionableIntelligenceCardsAPI } from "@/components/dashboard/actionable-intelligence-cards-api";

export default function DashboardAPIExample() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Episode Intelligence Dashboard (API Connected)</h1>
        <ActionableIntelligenceCardsAPI />
      </div>
    </div>
  );
}