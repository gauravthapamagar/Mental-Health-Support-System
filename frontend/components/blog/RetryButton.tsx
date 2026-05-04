"use client";

export default function RetryButton() {
  return (
    <button
      onClick={() => window.location.reload()}
      className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
    >
      Retry
    </button>
  );
}
