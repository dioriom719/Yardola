-- Phase 7: business onboarding and claim workflow hardening.
-- A business may have at most one active/pending claim from a claimant at a time.
create unique index if not exists business_claims_pending_unique_idx
  on public.business_claims (business_id, claimant_id)
  where status = 'pending';

-- Claimants can update/cancel only their own still-pending request. Approval
-- remains an admin action so ownership is never self-escalated.
create policy "Claimants can update their pending claims"
  on public.business_claims for update
  to authenticated
  using (claimant_id = (select auth.uid()) and status = 'pending')
  with check (claimant_id = (select auth.uid()) and status = 'pending');
