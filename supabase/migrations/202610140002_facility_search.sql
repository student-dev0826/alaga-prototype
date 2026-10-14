begin;

-- Normalize spelling separators, never infer that related treatments are equivalent.
create or replace function public.alaga_search_text(value text)
returns text language sql immutable security invoker set search_path = pg_catalog
as $$ select trim(regexp_replace(lower(coalesce(value, '')), '[^[:alnum:]]+', ' ', 'g')); $$;
revoke all on function public.alaga_search_text(text) from public;
grant execute on function public.alaga_search_text(text) to anon, authenticated;

create or replace function public.search_facilities(
  p_query text default '', p_city text default '', p_offset integer default 0
) returns jsonb language plpgsql stable security invoker set search_path = pg_catalog, public
as $$
declare
  answer jsonb;
begin
  if p_query is null or p_city is null or p_offset is null
     or char_length(p_query) > 200 or char_length(p_city) > 100
     or p_offset < 0 or p_offset > 100000 then
    raise exception 'Invalid search parameters' using errcode = '22023';
  end if;
  with query_text as (
    select public.alaga_search_text(p_query) as original,
      regexp_replace(regexp_replace(public.alaga_search_text(p_query),
        '^(please )?(i (need|want)( to get)?|looking for|find( me)?) ', ''),
        ' (near me|nearby)$', '') as term
  ), matched_services as (
    select s.id, s.name from public.services s, query_text q
    where s.is_verified and q.term <> '' and exists (
      select 1 from unnest(array[s.name] || s.synonyms) alias
      where public.alaga_search_text(alias) = q.term
    )
  ), matching as (
    select f.id, f.name, f.address, f.city, f.phone, f.operating_hours
    from public.facilities f, query_text q
    where f.is_verified
      and (trim(p_city) = '' or public.alaga_search_text(f.city) = public.alaga_search_text(p_city))
      and (trim(p_query) = '' or
        (exists(select 1 from matched_services) and exists (
          select 1 from public.facility_services fs
          join matched_services s on s.id = fs.service_id
          where fs.facility_id = f.id and fs.is_verified
        )) or
        (not exists(select 1 from matched_services) and q.original <> ''
          and strpos(public.alaga_search_text(f.name), q.original) > 0)
      )
  ), page as (
    select * from matching order by lower(name), id limit 12 offset p_offset
  )
  select jsonb_build_object(
    'total', (select count(*) from matching),
    'matched_services', (select coalesce(jsonb_agg(name order by name), '[]'::jsonb) from matched_services),
    'items', (select coalesce(jsonb_agg(to_jsonb(p) || jsonb_build_object('services', (
      select coalesce(jsonb_agg(s.name order by s.name), '[]'::jsonb)
      from public.facility_services fs join public.services s on s.id = fs.service_id
      where fs.facility_id = p.id and fs.is_verified and s.is_verified
    )) order by lower(p.name), p.id), '[]'::jsonb) from page p)
  ) into answer;
  return answer;
end; $$;
revoke all on function public.search_facilities(text, text, integer) from public;
grant execute on function public.search_facilities(text, text, integer) to anon, authenticated;
comment on function public.search_facilities(text, text, integer) is
  'Public verified directory; respects caller RLS. Service names/synonyms match exactly after removing simple request phrases. No scheduling availability is inferred.';
notify pgrst, 'reload schema';
commit;
