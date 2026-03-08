"use client";

import { StarRatingDisplay } from "./StarRating";
import type { ServiceReview } from "@/lib/api";

type ServiceReviewListProps = {
  reviews: ServiceReview[];
  averageRating: number;
  totalReviews: number;
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return iso;
  }
}

export default function ServiceReviewList({ reviews, averageRating, totalReviews }: ServiceReviewListProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <StarRatingDisplay rating={averageRating} showValue size="lg" />
        <span className="text-slate-400">
          {totalReviews} {totalReviews === 1 ? "yorum" : "yorum"}
        </span>
      </div>

      {reviews.length === 0 ? (
        <p className="text-slate-400 text-sm">Henüz yorum yok.</p>
      ) : (
        <ul className="space-y-4">
          {reviews.map((r) => (
            <li key={r.id} className="border-b border-slate-700 pb-4 last:border-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-white">{r.userName}</span>
                <StarRatingDisplay rating={r.rating} size="sm" />
              </div>
              {r.comment && <p className="mt-2 text-slate-300 text-sm">{r.comment}</p>}
              <p className="mt-1 text-slate-500 text-xs">{formatDate(r.createdAt)}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
