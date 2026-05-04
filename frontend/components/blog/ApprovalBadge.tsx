import { CheckCircle2 } from "lucide-react";

export default function ApprovalBadge({ name }: { name?: string }) {
  if (!name) return null;
  return (
    <div className="flex items-center text-xs text-gray-300 mt-2">
      <CheckCircle2 className="w-4 h-4 mr-1 text-white fill-green-500" />
      <span>Approved by {name}</span>
    </div>
  );
}
