"use client";

import { useState } from "react";
import { serviceReviews } from "@/lib/api";
import { StarRatingInput } from "./StarRating";

type ServiceReviewFormProps = {
  serviceId: string;
  onSuccess: () => void;
  isLoggedIn: boolean;
};

export default function ServiceReviewForm(props: ServiceReviewFormProps) {
  const { serviceId, onSuccess, isLoggedIn } = props;
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      setError("Yorum yapmak için giriş yapmalısınız.");
      return;
    }
    if (rating < 1 || rating > 5) {
      setError("Lütfen 1-5 arası puan verin.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await serviceReviews.create(serviceId, { rating, comment: comment.trim() || undefined });
      setRating(0);
      setComment("");
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yorum gönderilemedi.");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <p className="text-slate-400 text-sm">
        Yorum yapmak için <a href="/login" className="text-green-400 hover:underline">giriş yapın</a>.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Puan (1-5)</label>
        <StarRatingInput value={rating} onChange={setRating} />
      </div>
      <div>
        <label htmlFor="review-comment" className="block text-sm font-medium text-slate-300 mb-2">Yorum</label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-green-500"
          placeholder="Yorumunuzu yazın (isteğe bağlı)"
        />
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading || rating < 1}
        className="rounded-xl bg-green-500 hover:bg-green-600 disabled:opacity-50 px-6 py-3 font-medium text-white transition"
      >
        {loading ? "Gönderiliyor…" : "Yorum Gönder"}
      </button>
    </form>
  );
}
