-- Drop old policies that reference old roles
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Owners and admins can delete servers" ON public.servers;
DROP POLICY IF EXISTS "Owners can update their own servers" ON public.servers;
DROP POLICY IF EXISTS "Server joins are viewable by server owners and admins" ON public.server_joins;

-- Drop old function
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role);

-- Drop old enum type and create new one
DROP TYPE IF EXISTS public.app_role CASCADE;
CREATE TYPE public.app_role AS ENUM ('owner', 'serverowner');

-- Recreate user_roles table with new enum
DROP TABLE IF EXISTS public.user_roles CASCADE;
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Add credits to servers
ALTER TABLE public.servers ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 0;
ALTER TABLE public.servers ADD COLUMN IF NOT EXISTS is_promoted BOOLEAN DEFAULT false;
ALTER TABLE public.servers ADD COLUMN IF NOT EXISTS is_bumped BOOLEAN DEFAULT false;
ALTER TABLE public.servers ADD COLUMN IF NOT EXISTS bump_expires_at TIMESTAMPTZ;
ALTER TABLE public.servers ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'default';

-- Create server_votes table
CREATE TABLE public.server_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID REFERENCES public.servers(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  voted_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (server_id, user_id)
);
ALTER TABLE public.server_votes ENABLE ROW LEVEL SECURITY;

-- Create shop_items table
CREATE TABLE public.shop_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL, -- 'bump', 'promotion', 'theme'
  price INTEGER NOT NULL,
  duration_hours INTEGER, -- null for permanent items
  theme_data JSONB, -- for theme items
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.shop_items ENABLE ROW LEVEL SECURITY;

-- Create purchases table
CREATE TABLE public.purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID REFERENCES public.servers(id) ON DELETE CASCADE NOT NULL,
  item_id UUID REFERENCES public.shop_items(id) ON DELETE CASCADE NOT NULL,
  purchased_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true
);
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Check if user is site owner
CREATE OR REPLACE FUNCTION public.is_site_owner(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'owner'
  )
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles" 
ON public.user_roles FOR SELECT 
USING (user_id = auth.uid() OR public.is_site_owner(auth.uid()));

CREATE POLICY "Site owners can manage all roles" 
ON public.user_roles FOR ALL 
USING (public.is_site_owner(auth.uid()));

-- Update servers policies
CREATE POLICY "Server owners and site owner can update servers" 
ON public.servers FOR UPDATE 
USING (auth.uid() = owner_id OR public.is_site_owner(auth.uid()));

CREATE POLICY "Server owners and site owner can delete servers" 
ON public.servers FOR DELETE 
USING (auth.uid() = owner_id OR public.is_site_owner(auth.uid()));

-- Server votes policies
CREATE POLICY "Votes are viewable by everyone" 
ON public.server_votes FOR SELECT USING (true);

CREATE POLICY "Users can vote" 
ON public.server_votes FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their vote" 
ON public.server_votes FOR DELETE 
USING (auth.uid() = user_id);

-- Shop items policies
CREATE POLICY "Shop items are viewable by everyone" 
ON public.shop_items FOR SELECT USING (true);

CREATE POLICY "Site owner can manage shop" 
ON public.shop_items FOR ALL 
USING (public.is_site_owner(auth.uid()));

-- Purchases policies
CREATE POLICY "Server owners can view their purchases" 
ON public.purchases FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM public.servers WHERE servers.id = server_id AND servers.owner_id = auth.uid())
  OR public.is_site_owner(auth.uid())
);

CREATE POLICY "Server owners can purchase for their servers" 
ON public.purchases FOR INSERT 
WITH CHECK (
  EXISTS (SELECT 1 FROM public.servers WHERE servers.id = server_id AND servers.owner_id = auth.uid())
);

-- Server joins policy update
CREATE POLICY "Server joins viewable by owners" 
ON public.server_joins FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM public.servers WHERE servers.id = server_id AND servers.owner_id = auth.uid())
  OR public.is_site_owner(auth.uid())
);

-- Insert default shop items
INSERT INTO public.shop_items (name, description, type, price, duration_hours) VALUES
('Server Bump', 'Boost your server to the top for 48 hours', 'bump', 50, 48),
('Weekly Promotion', 'Featured at the top of all listings for 7 days', 'promotion', 200, 168),
('Monthly Promotion', 'Featured at the top of all listings for 30 days', 'promotion', 600, 720);

INSERT INTO public.shop_items (name, description, type, price, duration_hours, theme_data) VALUES
('Neon Theme', 'Vibrant neon colors for your server card', 'theme', 100, NULL, '{"gradient": "from-pink-500 to-cyan-500", "glow": true}'),
('Gold Theme', 'Premium gold styling for your server card', 'theme', 150, NULL, '{"gradient": "from-yellow-500 to-amber-600", "glow": true}'),
('Galaxy Theme', 'Cosmic purple theme for your server card', 'theme', 120, NULL, '{"gradient": "from-purple-600 to-indigo-600", "glow": true}');