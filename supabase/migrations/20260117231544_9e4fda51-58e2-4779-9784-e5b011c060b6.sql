-- Create server_reports table
CREATE TABLE public.server_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  server_id UUID NOT NULL REFERENCES public.servers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add unique constraint to prevent duplicate reports from same user
ALTER TABLE public.server_reports ADD CONSTRAINT unique_user_server_report UNIQUE (server_id, user_id);

-- Add is_blocked column to servers
ALTER TABLE public.servers ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT false;

-- Enable Row Level Security
ALTER TABLE public.server_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for server_reports
CREATE POLICY "Users can report servers"
ON public.server_reports
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own reports"
ON public.server_reports
FOR SELECT
USING (auth.uid() = user_id OR is_site_owner(auth.uid()));

CREATE POLICY "Site owner can delete reports"
ON public.server_reports
FOR DELETE
USING (is_site_owner(auth.uid()));

-- Create function to auto-block servers with 5+ reports
CREATE OR REPLACE FUNCTION public.check_server_reports()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  report_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO report_count
  FROM public.server_reports
  WHERE server_id = NEW.server_id;
  
  IF report_count >= 5 THEN
    UPDATE public.servers
    SET is_blocked = true
    WHERE id = NEW.server_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to check reports after insert
CREATE TRIGGER check_reports_after_insert
AFTER INSERT ON public.server_reports
FOR EACH ROW
EXECUTE FUNCTION public.check_server_reports();