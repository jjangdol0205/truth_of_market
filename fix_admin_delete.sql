-- ==========================================
-- Add missing DELETE policies for Admin actions
-- ==========================================

-- Enable DELETE on reports for Admin
DROP POLICY IF EXISTS "Allow delete for admins in reports" ON public.reports;
CREATE POLICY "Allow delete for admins in reports" ON public.reports
FOR DELETE
USING (auth.jwt() ->> 'email' = 'beable9489@gmail.com');

-- Enable DELETE on market_summaries for Admin
DROP POLICY IF EXISTS "Allow delete for admins in market_summaries" ON public.market_summaries;
CREATE POLICY "Allow delete for admins in market_summaries" ON public.market_summaries
FOR DELETE
USING (auth.jwt() ->> 'email' = 'beable9489@gmail.com');

-- Enable DELETE on company_requests for Admin
DROP POLICY IF EXISTS "Allow delete for admins in company_requests" ON public.company_requests;
CREATE POLICY "Allow delete for admins in company_requests" ON public.company_requests
FOR DELETE
USING (auth.jwt() ->> 'email' = 'beable9489@gmail.com');

-- (Optional) Just in case there was a fallback public policy that we need, 
-- but the specific Admin email policy is the safest and recommended approach.
