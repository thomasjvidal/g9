-- Add username column to profiles and update trigger to populate it
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username TEXT;

-- Ensure username is unique if provided (NULLs allowed)
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_unique
  ON public.profiles (username)
  WHERE username IS NOT NULL;

-- Update trigger function to also set username from user metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email),
    NEW.email,
    NULLIF(TRIM(NEW.raw_user_meta_data->>'username'), '')
  );
  RETURN NEW;
END;
$$;