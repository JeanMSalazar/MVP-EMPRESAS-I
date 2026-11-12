-- Return only the counterparty's contact details for an accepted quote.
-- Keep the existing profiles RLS policy limited to the profile owner.
begin;

create or replace function public.get_accepted_contact(p_request_id uuid)
returns table(id uuid, full_name text, phone text)
language sql
stable
security definer
set search_path = ''
rows 1
as $$
  select p.id, p.full_name, p.phone
  from public.service_requests as r
  join public.quotes as q on q.request_id = r.id
  join public.services as s on s.request_id = r.id and s.quote_id = q.id
    and s.client_id = r.client_id and s.professional_id = q.professional_id
  join public.profiles as p on p.id = case
    when (select auth.uid()) = r.client_id then q.professional_id
    when (select auth.uid()) = q.professional_id then r.client_id
    else null
  end
  where r.id = p_request_id
    and q.status = 'ACCEPTED'
    and s.status in ('ACCEPTED', 'COMPLETED', 'DISPUTED')
    and (select auth.uid()) in (r.client_id, q.professional_id)
  limit 1;
$$;

revoke all on function public.get_accepted_contact(uuid) from public, anon;
grant execute on function public.get_accepted_contact(uuid) to authenticated;

commit;
