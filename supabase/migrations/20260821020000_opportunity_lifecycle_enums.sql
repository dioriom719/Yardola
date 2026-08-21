-- Phase 13: marketplace opportunity lifecycle -- enum additions.
--
-- Extends the existing lead_matches/lead_events lifecycle (already
-- pending/sent/viewed/accepted/rejected/expired for match_status, and
-- created/matched/viewed/accepted/rejected/contacted/closed for
-- lead_event_type) with the four new stages the v1 opportunity/connection
-- marketplace model needs: a contractor expressing interest, YARDOLO
-- facilitating a connection, and the two terminal outcomes.
--
-- `accepted`/`rejected` are left as-is (unused by any app code today --
-- confirmed by inspection) rather than repurposed, so their meaning stays
-- unambiguous and no existing row's semantics can silently drift.
--
-- ALTER TYPE ... ADD VALUE cannot be used in the same transaction as a
-- statement that references the new value, so this migration only adds
-- values -- nothing in this file (or before it) uses them. The next
-- migration, which does use them, runs as a separate transaction.

alter type public.match_status add value if not exists 'interested';
alter type public.match_status add value if not exists 'connected';
alter type public.match_status add value if not exists 'won';
alter type public.match_status add value if not exists 'lost';

alter type public.lead_event_type add value if not exists 'interested';
alter type public.lead_event_type add value if not exists 'connected';
alter type public.lead_event_type add value if not exists 'won';
alter type public.lead_event_type add value if not exists 'lost';
