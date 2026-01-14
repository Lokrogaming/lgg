-- Update theme shop items to include font and color data
UPDATE public.shop_items 
SET theme_data = '{
  "accentColor": "#dc143c",
  "background": "linear-gradient(135deg, rgba(139, 0, 0, 0.1), rgba(220, 20, 60, 0.1))",
  "borderColor": "rgba(220, 20, 60, 0.5)",
  "fontFamily": "Creepster, cursive"
}
'
WHERE name = 'Blood Moon Theme';

UPDATE public.shop_items 
SET theme_data = '{
  "accentColor": "#483d8b",
  "background": "linear-gradient(135deg, rgba(25, 25, 112, 0.1), rgba(0, 0, 0, 0.1))",
  "borderColor": "rgba(72, 61, 139, 0.5)",
  "fontFamily": "Orbitron, sans-serif"
}
'
WHERE name = 'Dark Cosmic Theme';
