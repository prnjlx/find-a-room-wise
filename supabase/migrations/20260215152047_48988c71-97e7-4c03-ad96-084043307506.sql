
-- Add verification fields to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_phone_verified boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_document_verified boolean DEFAULT false;

-- Room reviews table
CREATE TABLE public.room_reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id uuid NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.room_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews" ON public.room_reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert reviews" ON public.room_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON public.room_reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reviews" ON public.room_reviews FOR DELETE USING (auth.uid() = user_id);

-- Room reports table
CREATE TABLE public.room_reports (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id uuid NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  reporter_id uuid NOT NULL,
  reason text NOT NULL,
  description text,
  status text DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.room_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert reports" ON public.room_reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Users can view own reports" ON public.room_reports FOR SELECT USING (auth.uid() = reporter_id);
