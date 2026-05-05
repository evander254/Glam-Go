
-- 1. Create portfolio table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.portfolio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create testimonials table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  rate INTEGER DEFAULT 5,
  quote TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Enable RLS
ALTER TABLE public.portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- 4. Redefine has_role to be more resilient
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS BOOLEAN LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE
  v_user_role text;
  v_email text;
BEGIN
  -- Get email from auth.users
  SELECT email INTO v_email FROM auth.users WHERE id = _user_id;
  
  -- Hardcoded Admin Bypass
  IF v_email = 'admin@glamandgo.com' THEN
    RETURN true;
  END IF;

  -- Check public.users table (supporting the BIGINT ID migration)
  -- Matches by email since auth.users(uuid) and public.users(bigint) IDs differ
  SELECT u.role INTO v_user_role
  FROM public.users u
  WHERE LOWER(u.email) = LOWER(v_email)
  LIMIT 1;

  RETURN COALESCE(v_user_role, '') = _role;
END;
$$;

-- 5. Apply table policies
DO $$ 
BEGIN
    -- Portfolio Policies
    DROP POLICY IF EXISTS "Public view portfolio" ON public.portfolio;
    CREATE POLICY "Public view portfolio" ON public.portfolio FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Admins manage portfolio" ON public.portfolio;
    CREATE POLICY "Admins manage portfolio" ON public.portfolio 
      FOR ALL USING (
        (auth.jwt() ->> 'email') = 'admin@glamandgo.com' 
        OR public.has_role(auth.uid(), 'admin')
      ) 
      WITH CHECK (
        (auth.jwt() ->> 'email') = 'admin@glamandgo.com' 
        OR public.has_role(auth.uid(), 'admin')
      );

    -- Testimonials Policies
    DROP POLICY IF EXISTS "Public view testimonials" ON public.testimonials;
    CREATE POLICY "Public view testimonials" ON public.testimonials FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Admins manage testimonials" ON public.testimonials;
    CREATE POLICY "Admins manage testimonials" ON public.testimonials 
      FOR ALL USING (
        (auth.jwt() ->> 'email') = 'admin@glamandgo.com' 
        OR public.has_role(auth.uid(), 'admin')
      ) 
      WITH CHECK (
        (auth.jwt() ->> 'email') = 'admin@glamandgo.com' 
        OR public.has_role(auth.uid(), 'admin')
      );
END $$;

-- 6. Storage Setup
-- Ensure bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio', 'portfolio', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 7. Apply storage policies
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Public view portfolio images" ON storage.objects;
    CREATE POLICY "Public view portfolio images" ON storage.objects 
      FOR SELECT USING (bucket_id = 'portfolio');

    DROP POLICY IF EXISTS "Admins manage portfolio images" ON storage.objects;
    CREATE POLICY "Admins manage portfolio images" ON storage.objects 
      FOR ALL USING (
        bucket_id = 'portfolio' AND (
          (auth.jwt() ->> 'email') = 'admin@glamandgo.com' 
          OR public.has_role(auth.uid(), 'admin')
        )
      )
      WITH CHECK (
        bucket_id = 'portfolio' AND (
          (auth.jwt() ->> 'email') = 'admin@glamandgo.com' 
          OR public.has_role(auth.uid(), 'admin')
        )
      );
END $$;
