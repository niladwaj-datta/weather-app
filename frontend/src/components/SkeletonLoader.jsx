import React from 'react';

export default function SkeletonLoader() {
  return (
    <div>
      <div className="dashboard-grid">
        {/* Hero Card Skeleton */}
        <div className="glass-card loading-skeleton" style={{ height: '280px' }}></div>
        {/* Metrics Grid Skeleton */}
        <div className="metrics-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="loading-skeleton"
              style={{ height: '110px' }}
            ></div>
          ))}
        </div>
      </div>
      {/* Hourly Skeleton */}
      <div className="glass-card loading-skeleton" style={{ height: '150px', marginBottom: '1.5rem' }}></div>
      {/* Daily Skeleton */}
      <div className="glass-card loading-skeleton" style={{ height: '320px' }}></div>
    </div>
  );
}

