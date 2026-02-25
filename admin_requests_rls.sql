-- Enable the Admin to read all incoming company requests.
-- This policy checks if the logged-in user's email matches the admin email.
CREATE POLICY "Admin can view all" ON company_requests 
    FOR SELECT 
    USING (auth.jwt() ->> 'email' = 'beable9489@gmail.com');

-- (Optional) If you also want to let the admin delete them from the dashboard:
CREATE POLICY "Admin can delete all" ON company_requests 
    FOR DELETE
    USING (auth.jwt() ->> 'email' = 'beable9489@gmail.com');
