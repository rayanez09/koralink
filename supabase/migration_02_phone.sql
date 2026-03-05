-- Migration 02 : Capture du numéro de téléphone à l'inscription

-- Mise à jour de la fonction (trigger) pour inclure le phone_number provenant des métadonnées Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role, phone_number)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name', 
    'user',
    new.raw_user_meta_data->>'phone_number'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
