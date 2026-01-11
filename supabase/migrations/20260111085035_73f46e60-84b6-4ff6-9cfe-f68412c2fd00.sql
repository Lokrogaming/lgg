-- Add customization and landing page fields to servers table
ALTER TABLE public.servers 
ADD COLUMN IF NOT EXISTS custom_card_data jsonb DEFAULT NULL,
ADD COLUMN IF NOT EXISTS custom_landing_data jsonb DEFAULT NULL,
ADD COLUMN IF NOT EXISTS has_custom_card boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS has_custom_landing boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS dcs_short_code text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS guild_id text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS online_count integer DEFAULT 0;

-- Add Full Customization item to shop
INSERT INTO public.shop_items (name, description, type, price, duration_hours, theme_data, is_active)
VALUES (
  'Full Customization',
  'Fully customize your server card and landing page with custom colors, backgrounds, fonts, and more!',
  'customization',
  1000,
  NULL,
  '{"features": ["custom_card", "custom_landing", "custom_fonts", "custom_colors", "custom_background"]}',
  true
);

-- Update theme shop items to include font and color data
UPDATE public.shop_items 
SET theme_data = '{"background": "linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(6, 182, 212, 0.1))", "borderColor": "rgba(236, 72, 153, 0.5)", "fontFamily": "Orbitron, sans-serif", "accentColor": "#ec4899"}'
WHERE name = 'Neon Theme';

UPDATE public.shop_items 
SET theme_data = '{"background": "linear-gradient(135deg, rgba(234, 179, 8, 0.1), rgba(217, 119, 6, 0.1))", "borderColor": "rgba(234, 179, 8, 0.5)", "fontFamily": "Cinzel, serif", "accentColor": "#eab308"}'
WHERE name = 'Gold Theme';

UPDATE public.shop_items 
SET theme_data = '{"background": "linear-gradient(135deg, rgba(147, 51, 234, 0.1), rgba(79, 70, 229, 0.1))", "borderColor": "rgba(147, 51, 234, 0.5)", "fontFamily": "Space Grotesk, sans-serif", "accentColor": "#9333ea"}'
WHERE name = 'Galaxy Theme';