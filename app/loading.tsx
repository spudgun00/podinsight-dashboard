export default function Loading() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-deep-black">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-brand-purple border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-lg text-white/80 overflow-hidden whitespace-nowrap border-r-4 border-r-white/80 pr-5 animate-typewriter">
          Analyzing 1,000+ hours of podcast intelligence...
        </p>
      </div>
    </div>
  )
}
