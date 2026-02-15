import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Send } from "lucide-react";
import { toast } from "sonner";

interface Review {
  id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
  user_id: string;
}

export default function RoomReviews({ roomId }: { roomId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
    getUser();
  }, [roomId]);

  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUserId(user?.id || null);
  };

  const fetchReviews = async () => {
    const { data } = await supabase
      .from("room_reviews")
      .select("*")
      .eq("room_id", roomId)
      .order("created_at", { ascending: false });
    setReviews(data || []);
  };

  const handleSubmit = async () => {
    if (!userId) {
      toast.error("Please login to leave a review");
      return;
    }
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("room_reviews").insert({
        room_id: roomId,
        user_id: userId,
        rating,
        review_text: reviewText || null,
      });
      if (error) throw error;
      toast.success("Review submitted!");
      setRating(0);
      setReviewText("");
      fetchReviews();
    } catch {
      toast.error("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Reviews & Ratings</h2>
        {avgRating && (
          <div className="flex items-center gap-1.5">
            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            <span className="font-bold text-lg">{avgRating}</span>
            <span className="text-sm text-muted-foreground">({reviews.length})</span>
          </div>
        )}
      </div>

      {/* Submit Review */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`h-6 w-6 ${
                    star <= (hoverRating || rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground"
                  }`}
                />
              </button>
            ))}
          </div>
          <Textarea
            placeholder="Share your experience (optional)..."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            rows={2}
          />
          <Button onClick={handleSubmit} disabled={submitting} size="sm">
            <Send className="h-4 w-4 mr-2" />
            Submit Review
          </Button>
        </CardContent>
      </Card>

      {/* Review List */}
      {reviews.map((review) => (
        <Card key={review.id}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= review.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date(review.created_at).toLocaleDateString()}
              </span>
            </div>
            {review.review_text && (
              <p className="text-sm text-muted-foreground">{review.review_text}</p>
            )}
          </CardContent>
        </Card>
      ))}

      {reviews.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          No reviews yet. Be the first to review!
        </p>
      )}
    </div>
  );
}
