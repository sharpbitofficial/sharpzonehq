-- Revoke broad UPDATE on orders from authenticated role
REVOKE UPDATE ON public.orders FROM authenticated;

-- Grant UPDATE only on feedback and rating columns to authenticated users
GRANT UPDATE (feedback, rating) ON public.orders TO authenticated;

-- Grant full UPDATE to service_role (used by edge functions/admin)
GRANT UPDATE ON public.orders TO service_role;