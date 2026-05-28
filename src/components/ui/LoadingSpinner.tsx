import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

export default function LoadingSpinner({ size = 'md', fullScreen = false }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div 
        className={`${sizeClasses[size]} rounded-full animate-spin border-amber-500/30 border-t-amber-500`}
        role="status"
      />
      {fullScreen && (
        <p className="text-slate-400 font-medium animate-pulse text-sm">Memuat data SPPG...</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex items-center justify-center z-[9999]">
        {spinner}
      </div>
    );
  }

  return spinner;
}
