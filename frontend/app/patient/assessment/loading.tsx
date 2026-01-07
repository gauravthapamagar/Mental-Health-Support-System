export default function AssessmentLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-20 h-20 mx-auto mb-6">
          {/* Outer ring */}
          <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
          {/* Spinning ring */}
          <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          {/* Inner pulse */}
          <div className="absolute inset-3 bg-blue-100 rounded-full animate-pulse"></div>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          Loading Assessment
        </h2>
        <p className="text-slate-600">Preparing your questions...</p>
      </div>
    </div>
  );
}
