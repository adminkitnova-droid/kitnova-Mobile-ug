import React from 'react';

interface RelayLoaderProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg' | 'fullscreen';
}

export const RelayLoader: React.FC<RelayLoaderProps> = ({
  message = 'Loading your KITNOVA experience…',
  size = 'md'
}) => {
  if (size === 'fullscreen') {
    return (
      <div className="fixed inset-0 z-50 bg-[#0A1A3C] flex flex-col items-center justify-center p-6 select-none">
        {/* Brand Emblem */}
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#0F2A5F] via-[#D4A029] to-[#F0C760] p-0.5 shadow-2xl animate-pulse">
            <div className="w-full h-full bg-[#0A1A3C] rounded-[14px] flex items-center justify-center">
              <span className="text-2xl font-black text-[#D4A029] tracking-tighter">K</span>
            </div>
          </div>
          <div className="absolute -inset-1 rounded-2xl bg-[#D4A029]/20 blur-md -z-10" />
        </div>

        {/* Wordmark */}
        <div className="text-center space-y-1 mb-6">
          <h2 className="text-xl font-black tracking-widest text-white">
            KITNOVA<span className="text-[#D4A029] font-medium text-xs ml-1 tracking-normal">JERSEY</span>
          </h2>
          <p className="text-[11px] text-slate-400 font-medium tracking-wide">
            Premium Jersey. Designed Your Way.
          </p>
        </div>

        {/* Relay Baton Moving Animation */}
        <div className="w-48 py-2 relative flex items-center justify-center">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D4A029] animate-bounce [animation-delay:0ms] shadow-sm shadow-[#D4A029]" />
            <span className="w-2 h-0.5 bg-[#D4A029]/40" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#D4A029] animate-bounce [animation-delay:180ms] shadow-sm shadow-[#D4A029]" />
            <span className="w-2 h-0.5 bg-[#D4A029]/40" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#D4A029] animate-bounce [animation-delay:360ms] shadow-sm shadow-[#D4A029]" />
          </div>
        </div>

        {/* Dynamic Context Message */}
        <p className="text-xs text-slate-300 font-mono tracking-wide mt-3 text-center">
          {message}
        </p>

        {/* Subtle Gold Progress Line */}
        <div className="w-48 h-0.5 bg-slate-800 rounded-full mt-4 overflow-hidden">
          <div className="w-full h-full bg-gradient-to-r from-transparent via-[#D4A029] to-transparent animate-[shimmer_1.5s_infinite] -translate-x-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-3">
      {/* Three sequential relay batons */}
      <div className="flex items-center gap-2.5">
        <span className="w-2 h-2 rounded-full bg-[#D4A029] animate-bounce [animation-delay:0ms]" />
        <span className="w-1.5 h-0.5 bg-[#D4A029]/40" />
        <span className="w-2 h-2 rounded-full bg-[#D4A029] animate-bounce [animation-delay:150ms]" />
        <span className="w-1.5 h-0.5 bg-[#D4A029]/40" />
        <span className="w-2 h-2 rounded-full bg-[#D4A029] animate-bounce [animation-delay:300ms]" />
      </div>
      <p className="text-xs text-slate-400 font-medium text-center">{message}</p>
    </div>
  );
};

/* Skeleton Shimmer Component */
export const SkeletonShimmer: React.FC<{ className?: string }> = ({ className = 'h-4 w-full rounded' }) => (
  <div className={`bg-slate-800/80 relative overflow-hidden ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
  </div>
);

/* Home Skeleton View */
export const HomeSkeleton: React.FC = () => (
  <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-pulse">
    {/* Hero Banner Skeleton */}
    <SkeletonShimmer className="w-full aspect-[16/9] md:aspect-[21/9] rounded-2xl" />

    {/* Categories Skeleton */}
    <div className="flex gap-3 overflow-x-auto py-2">
      {[1, 2, 3, 4, 5].map(i => (
        <SkeletonShimmer key={i} className="w-24 h-9 rounded-xl shrink-0" />
      ))}
    </div>

    {/* Featured Grid Skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-[#0A1A3C] border border-slate-800 rounded-2xl p-4 space-y-4">
          <SkeletonShimmer className="w-full aspect-[4/3] rounded-xl" />
          <SkeletonShimmer className="h-4 w-3/4" />
          <SkeletonShimmer className="h-3 w-1/2" />
          <div className="flex justify-between items-center pt-2">
            <SkeletonShimmer className="h-5 w-20" />
            <SkeletonShimmer className="h-8 w-24 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  </div>
);
