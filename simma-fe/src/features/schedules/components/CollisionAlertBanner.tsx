import React from "react";
import { AlertCircle, AlertTriangle } from "lucide-react";
import type { CollisionResult } from "../types";

interface CollisionAlertBannerProps {
  collisionResult: CollisionResult | null;
}

export const CollisionAlertBanner: React.FC<CollisionAlertBannerProps> = ({ collisionResult }) => {
  if (!collisionResult) return null;

  const { hasCollision, collisions, warnings } = collisionResult;

  if (!hasCollision && (!warnings || warnings.length === 0)) {
    return null;
  }

  return (
    <div className="space-y-2">
      {hasCollision && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-800">
          <div className="flex items-center gap-2 font-semibold text-xs">
            <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
            <span>Terdeteksi Bentrok Jadwal (Hard Conflict):</span>
          </div>
          <ul className="mt-1 list-disc pl-5 text-xs space-y-0.5">
            {collisions.map((c, idx) => (
              <li key={idx}>{c.message}</li>
            ))}
          </ul>
        </div>
      )}

      {warnings && warnings.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-800">
          <div className="flex items-center gap-2 font-semibold text-xs">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
            <span>Peringatan Beban Mengajar (Soft Warning):</span>
          </div>
          <ul className="mt-1 list-disc pl-5 text-xs space-y-0.5">
            {warnings.map((w, idx) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
