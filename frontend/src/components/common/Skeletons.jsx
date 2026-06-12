import React from 'react';

export const SkeletonCard = () => (
  <div className="animate-pulse glass-card p-6 h-full flex flex-col justify-between min-h-[170px]">
    <div className="flex items-center justify-between mb-4">
      <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
      <div className="w-12 h-4 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
    </div>
    <div className="space-y-2 flex-1 flex flex-col justify-center">
      <div className="w-24 h-4 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
      <div className="w-32 h-7 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
    </div>
    <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full mt-4"></div>
  </div>
);

export const SkeletonInsight = () => (
  <div className="animate-pulse glass-card p-6 bg-slate-100 dark:bg-slate-900/10 flex gap-4 min-h-[120px] w-full">
    <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-3xl shrink-0"></div>
    <div className="flex-1 space-y-3">
      <div className="w-24 h-5 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
      <div className="w-full h-4 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
      <div className="w-4/5 h-4 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
    </div>
  </div>
);

export const SkeletonChart = () => (
  <div className="animate-pulse glass-card p-6 h-full min-h-[350px] flex flex-col justify-between w-full">
    <div className="flex items-center gap-2 mb-6">
      <div className="w-5 h-5 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
      <div className="w-32 h-5 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
    </div>
    <div className="flex-1 flex items-end gap-3 w-full h-48 border-b border-l border-border-color p-2">
      <div className="w-full bg-slate-200/50 dark:bg-slate-800/50 rounded-t-lg" style={{ height: '40%' }}></div>
      <div className="w-full bg-slate-200/50 dark:bg-slate-800/50 rounded-t-lg" style={{ height: '70%' }}></div>
      <div className="w-full bg-slate-200/50 dark:bg-slate-800/50 rounded-t-lg" style={{ height: '55%' }}></div>
      <div className="w-full bg-slate-200/50 dark:bg-slate-800/50 rounded-t-lg" style={{ height: '85%' }}></div>
      <div className="w-full bg-slate-200/50 dark:bg-slate-800/50 rounded-t-lg" style={{ height: '30%' }}></div>
      <div className="w-full bg-slate-200/50 dark:bg-slate-800/50 rounded-t-lg" style={{ height: '60%' }}></div>
      <div className="w-full bg-slate-200/50 dark:bg-slate-800/50 rounded-t-lg" style={{ height: '75%' }}></div>
    </div>
    <div className="flex justify-between mt-3 text-xs w-full px-2">
      <div className="w-8 h-3 bg-slate-200 dark:bg-slate-800 rounded-sm"></div>
      <div className="w-8 h-3 bg-slate-200 dark:bg-slate-800 rounded-sm"></div>
      <div className="w-8 h-3 bg-slate-200 dark:bg-slate-800 rounded-sm"></div>
      <div className="w-8 h-3 bg-slate-200 dark:bg-slate-800 rounded-sm"></div>
    </div>
  </div>
);

export const SkeletonReportHistory = () => (
  <div className="animate-pulse space-y-3 w-full flex-1">
    {[1, 2, 3, 4].map(n => (
      <div key={n} className="p-3 rounded-xl border border-transparent bg-surface/50 flex items-center justify-between gap-2 h-14">
        <div className="flex gap-2 min-w-0 w-full">
          <div className="w-5 h-5 bg-slate-200 dark:bg-slate-800 rounded-md shrink-0"></div>
          <div className="min-w-0 flex-1 space-y-2">
            <div className="w-2/3 h-4 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
            <div className="w-1/2 h-3 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const SkeletonAnalysisPanel = () => (
  <div className="animate-pulse glass-card p-6 md:p-8 space-y-6 h-full min-h-[500px] flex flex-col w-full">
    <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border-color">
      <div className="space-y-2 flex-1">
        <div className="w-48 h-6 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
        <div className="w-36 h-3.5 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
      </div>
      <div className="w-32 h-8 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
    </div>
    <div className="space-y-6 flex-1">
      <div className="space-y-3">
        <div className="w-28 h-5 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
        <div className="w-full h-4 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
        <div className="w-11/12 h-4 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
        <div className="w-4/5 h-4 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
      </div>
      <div className="space-y-3">
        <div className="w-36 h-5 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
        <div className="w-full h-12 bg-slate-200/50 dark:bg-slate-800/50 rounded-xl"></div>
      </div>
      <div className="space-y-3">
        <div className="w-28 h-5 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
        <div className="w-11/12 h-4 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
        <div className="w-5/6 h-4 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
      </div>
    </div>
  </div>
);

export const SkeletonGoalBanner = () => (
  <div className="animate-pulse glass-card p-8 flex flex-col items-center justify-center min-h-[220px] w-full text-center">
    <div className="w-32 h-4 bg-slate-200 dark:bg-slate-800 rounded-md mb-4"></div>
    <div className="w-48 h-12 bg-slate-200 dark:bg-slate-800 rounded-md mb-6"></div>
    <div className="w-full bg-slate-200 dark:bg-slate-800 h-4 rounded-full"></div>
    <div className="w-24 h-4 bg-slate-200 dark:bg-slate-800 rounded-md mt-4"></div>
  </div>
);

export const SkeletonLogList = () => (
  <div className="animate-pulse space-y-3 w-full">
    {[1, 2, 3].map(n => (
      <div key={n} className="flex justify-between items-center p-4 bg-card rounded-xl border border-border-color h-16">
        <div className="flex items-center gap-3 w-full">
          <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-lg shrink-0"></div>
          <div className="min-w-0 flex-1 space-y-2">
            <div className="w-24 h-4 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
            <div className="w-16 h-3 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
          </div>
        </div>
        <div className="w-12 h-4 bg-slate-200 dark:bg-slate-800 rounded-md shrink-0"></div>
      </div>
    ))}
  </div>
);
