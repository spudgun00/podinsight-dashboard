import TopicVelocityChart from "@/components/TopicVelocityChart";

export default function Home() {
  return (
    <main className="min-h-screen">
      <div className="container mx-auto max-w-[1400px] px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
            PodInsightHQ
          </h1>
          <p className="text-gray-400 mt-2">
            Transform podcast intelligence into actionable insights
          </p>
        </header>
        
        <TopicVelocityChart />
      </div>
    </main>
  );
}