import React, { useState } from "react";
import { X, Loader2 } from "lucide-react";

interface ReportModalProps {
  type: "post" | "comment";
  onClose: () => void;
  onSubmit: (reason: string, details: string) => Promise<void>;
}

const ReportModal: React.FC<ReportModalProps> = ({ type, onClose, onSubmit }) => {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);

  const reasons = [
    { value: "spam", label: "Spam or Advertising" },
    { value: "harassment", label: "Harassment or Bullying" },
    { value: "inappropriate", label: "Inappropriate Content" },
    { value: "misinformation", label: "Medical Misinformation" },
    { value: "self_harm", label: "Self-Harm or Suicide Content" },
    { value: "other", label: "Other" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason) {
      return;
    }

    try {
      setLoading(true);
      await onSubmit(reason, details);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-bold text-gray-900">
            Report {type === "post" ? "Post" : "Comment"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Reason */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Reason for reporting <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {reasons.map((r) => (
                <label
                  key={r.value}
                  className="flex items-center space-x-3 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="reason"
                    value={r.value}
                    checked={reason === r.value}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-gray-700">{r.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Details */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Additional details (optional)
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              placeholder="Provide more context about why you're reporting this..."
            />
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> False reports may result in restrictions on
              your account. Our moderation team will review this report.
            </p>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={!reason || loading}
              className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Submit Report</span>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportModal;