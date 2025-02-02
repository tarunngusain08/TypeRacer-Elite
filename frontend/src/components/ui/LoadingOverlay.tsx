const LoadingOverlay = () => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin-slow" />
      <div className="w-12 h-12 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin-slow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-sm font-medium animate-pulse">
        Loading
      </div>
    </div>
  </div>
);

export default LoadingOverlay; 