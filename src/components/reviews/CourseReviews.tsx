'use client';

import { useState, useEffect } from 'react';
import StarRating from './StarRating';

interface Review {
  id: string;
  rating: number;
  title: string;
  content: string;
  studentName: string;
  createdAt: string;
  isVerified: number;
}

interface ReviewStats {
  totalReviews: number;
  avgRating: number;
  fiveStar: number;
  fourStar: number;
  threeStar: number;
  twoStar: number;
  oneStar: number;
}

interface CourseReviewsProps {
  courseId: string;
}

export default function CourseReviews({ courseId }: CourseReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`/api/public/courses/${courseId}/reviews`);
        const data = await res.json();
        if (data.success) {
          setReviews(data.data.reviews);
          setStats(data.data.stats);
        }
      } catch (err) {
        console.error('Fetch reviews error:', err);
      }
      setLoading(false);
    };
    fetchReviews();
  }, [courseId]);

  if (loading) return <div className="text-center py-8 text-slate-500">Loading reviews...</div>;

  if (!stats) return null;

  const ratingDistribution = [
    { stars: 5, count: stats.fiveStar },
    { stars: 4, count: stats.fourStar },
    { stars: 3, count: stats.threeStar },
    { stars: 2, count: stats.twoStar },
    { stars: 1, count: stats.oneStar },
  ];

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="flex items-center gap-8">
        <div className="text-center">
          <p className="text-4xl font-bold text-slate-900 dark:text-white">{Number(stats.avgRating).toFixed(1)}</p>
          <StarRating rating={Math.round(stats.avgRating)} size="md" />
          <p className="text-sm text-slate-500 mt-1">{stats.totalReviews} reviews</p>
        </div>
        <div className="flex-1 space-y-1">
          {ratingDistribution.map(({ stars, count }) => (
            <div key={stars} className="flex items-center gap-2">
              <span className="text-xs text-slate-500 w-8">{stars}★</span>
              <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 rounded-full"
                  style={{ width: `${stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0}%` }}
                />
              </div>
              <span className="text-xs text-slate-500 w-8 text-right">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <p className="text-center text-slate-500 py-4">No reviews yet</p>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <div key={review.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <StarRating rating={review.rating} size="sm" />
                    {review.isVerified ? (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Verified</span>
                    ) : null}
                  </div>
                  {review.title && (
                    <h4 className="font-bold text-slate-900 dark:text-white mt-2">{review.title}</h4>
                  )}
                  {review.content && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{review.content}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">{review.studentName}</p>
                  <p className="text-xs text-slate-400">{new Date(review.createdAt).toLocaleDateString('en-IN')}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
