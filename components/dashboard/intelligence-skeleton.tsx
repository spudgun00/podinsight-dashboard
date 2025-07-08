import React from "react";

export const IntelligenceSkeleton = () => {
  return (
    <section className="mt-16 mb-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className="relative animate-pulse"
            style={{
              backgroundColor: "rgba(26, 26, 28, 0.98)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "20px",
              padding: "28px",
              height: "auto",
              minHeight: "420px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div className="flex flex-col h-full">
              {/* Header Section */}
              <div className="pb-4 border-b border-gray-800/50">
                <div className="flex items-start gap-3">
                  {/* Icon Skeleton */}
                  <div
                    className="bg-gray-800 rounded-xl"
                    style={{
                      width: "48px",
                      height: "48px",
                    }}
                  />
                  {/* Title Skeleton */}
                  <div className="flex-1">
                    <div className="h-6 bg-gray-800 rounded w-3/4" />
                  </div>
                </div>
              </div>

              {/* Metric Section */}
              <div className="py-4 px-1">
                <div className="flex items-baseline gap-2">
                  <div className="h-10 w-16 bg-gray-800 rounded" />
                  <div className="h-4 w-24 bg-gray-800 rounded" />
                </div>
                <div className="h-3 w-20 bg-gray-800 rounded mt-2" />
              </div>

              {/* Content Items */}
              <div className="flex-1 overflow-hidden">
                <div className="h-3 w-24 bg-gray-800 rounded mb-3" />
                <div className="space-y-2.5">
                  {[...Array(3)].map((_, idx) => (
                    <div key={idx} className="p-2">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-gray-800 rounded-full mt-0.5" />
                        <div className="flex-1 space-y-1">
                          <div className="h-4 bg-gray-800 rounded w-full" />
                          <div className="h-3 bg-gray-800 rounded w-5/6" />
                          <div className="h-2 bg-gray-800 rounded w-1/3 mt-1" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="mt-auto pt-4 border-t border-gray-800/50">
                <div className="h-10 bg-gray-800 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Divider line */}
      <div 
        className="mt-16"
        style={{
          height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.1) 20%, rgba(139, 92, 246, 0.1) 80%, transparent)"
        }}
      />
    </section>
  );
};