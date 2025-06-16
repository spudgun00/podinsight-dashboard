export default function LoadingSkeleton() {
  return (
    <div className="w-full p-6 bg-gray-900/50 backdrop-blur-md rounded-lg border border-gray-800">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-800 rounded w-1/3 mb-6"></div>
        <div className="h-[400px] bg-gray-800/50 rounded mb-4"></div>
        <div className="flex justify-center space-x-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-4 bg-gray-800 rounded w-24"></div>
          ))}
        </div>
      </div>
      <p className="text-center text-gray-500 mt-4">
        Analyzing podcast intelligence...
      </p>
    </div>
  );
}