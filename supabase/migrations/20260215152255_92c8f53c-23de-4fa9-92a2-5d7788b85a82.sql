
-- Allow reading basic profile info (verification badges) for any authenticated user
CREATE POLICY "Authenticated users can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);
