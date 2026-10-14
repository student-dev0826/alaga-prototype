// @vitest-environment node
import { beforeAll, afterAll, beforeEach, describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
let db;
const alice = '00000000-0000-4000-8000-000000000001';
const bob = '00000000-0000-4000-8000-000000000002';
const facility = '00000000-0000-4000-8000-000000000010';
const service = '00000000-0000-4000-8000-000000000020';
const relationship = '00000000-0000-4000-8000-000000000030';
const slot = '00000000-0000-4000-8000-000000000040';
beforeAll(async () => {
  db = new PGlite();
  await db.exec(`create role anon nologin; create role authenticated nologin;
    create schema auth; create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema auth to anon, authenticated; grant execute on function auth.uid() to anon, authenticated;
    insert into auth.users values ('${alice}');`);
  await db.exec(await readFile('supabase/migrations/202610140001_foundation.sql', 'utf8'));
  await db.exec(`insert into auth.users values ('${bob}');
    insert into public.facilities(id,name,address,city,is_verified,verified_at,booking_enabled) values ('${facility}','DEMO Verified Facility','DEMO Address','DEMO City',true,now(),true);
    insert into public.facilities(name,address,city) values ('DEMO Hidden Facility','DEMO Address','DEMO City');
    insert into public.services(id,slug,name,is_verified,verified_at) values ('${service}','demo-service','DEMO Service',true,now());
    insert into public.facility_services(id,facility_id,service_id,is_verified,verified_at,booking_enabled) values ('${relationship}','${facility}','${service}',true,now(),true);
    insert into public.appointment_slots(id,facility_service_id,starts_at,ends_at,is_published) values ('${slot}','${relationship}',now()+interval '2 days',now()+interval '2 days 1 hour',true);
    insert into public.appointments(user_id,slot_id) values ('${alice}','${slot}'),('${bob}','${slot}');
    insert into public.notifications(user_id,title,message) values ('${alice}','DEMO Alice','DEMO message'),('${bob}','DEMO Bob','DEMO message');
    insert into public.health_articles(category_id,title,body,reviewed_at,published_at) values ('c1','DEMO Published','DEMO not medical advice',now(),now()),('c1','DEMO Future','DEMO not medical advice',now(),now()+interval '1 day');
    insert into public.health_articles(category_id,title,body) values ('c1','DEMO Draft','DEMO not medical advice');`);
}, 30_000);
afterAll(async () => { await db?.close(); });
beforeEach(async () => { await db.exec(`reset role; select set_config('request.jwt.claim.sub', '${alice}', false);`); });
async function rows(sql) { return (await db.query(sql)).rows; }
describe('actual PostgreSQL migration and RLS behavior', () => {
  it('creates resident records for existing and new auth users', async () => {
    expect(await rows('select id from public.profiles')).toHaveLength(2);
    expect(await rows('select user_id from public.user_preferences')).toHaveLength(2);
    expect(await rows("select relname from pg_class where relnamespace='public'::regnamespace and relkind='r' and relrowsecurity")).toHaveLength(9);
  });
  it('allows residents to read only their own private records', async () => {
    await db.exec('set role authenticated');
    for (const table of ['profiles', 'user_preferences', 'appointments', 'notifications']) expect(await rows(`select * from public.${table}`)).toHaveLength(1);
    await db.exec(`select set_config('request.jwt.claim.sub', '${bob}', false)`);
    expect(await rows('select id from public.profiles')).toEqual([{ id: bob }]);
    await db.exec("select set_config('request.jwt.claim.sub', '', false)");
    expect(await rows('select id from public.profiles')).toHaveLength(0);
  });
  it('denies anonymous private reads and all client scheduling writes', async () => {
    await db.exec('set role anon');
    await expect(db.query('select * from public.profiles')).rejects.toMatchObject({ code: '42501' });
    await db.exec('reset role; set role authenticated');
    await expect(db.query(`insert into public.appointments(user_id,slot_id) values ('${alice}','${slot}')`)).rejects.toMatchObject({ code: '42501' });
    await expect(db.query("update public.facilities set is_verified = true")).rejects.toMatchObject({ code: '42501' });
    await expect(db.query('update public.appointment_slots set reserved_count=1')).rejects.toMatchObject({ code: '42501' });
    await expect(db.query("update public.appointments set status='completed'")).rejects.toMatchObject({ code: '42501' });
  });
  it('allows safe owner updates but prevents owner/timestamp changes and other-user updates', async () => {
    await db.exec('set role authenticated');
    expect((await db.query(`update public.profiles set display_name='DEMO Resident' where id='${alice}' returning display_name`)).rows).toEqual([{ display_name: 'DEMO Resident' }]);
    expect((await db.query(`update public.profiles set display_name='DEMO Intrusion' where id='${bob}' returning id`)).rows).toHaveLength(0);
    await expect(db.query(`update public.profiles set id='${bob}'`)).rejects.toMatchObject({ code: '42501' });
    await expect(db.query("update public.profiles set updated_at='2000-01-01'")).rejects.toMatchObject({ code: '42501' });
    await expect(db.query("update public.notifications set message='tampered'")).rejects.toMatchObject({ code: '42501' });
    const read = await db.query("update public.notifications set read_at='2099-01-01' returning read_at <= now() as valid");
    expect(read.rows).toEqual([{ valid: true }]);
  });
  it('publishes only verified facilities, verified relationships and reviewed articles', async () => {
    await db.exec('set role anon');
    expect(await rows('select name from public.facilities')).toEqual([{ name: 'DEMO Verified Facility' }]);
    expect(await rows('select id from public.facility_services')).toHaveLength(1);
    expect(await rows('select id from public.appointment_slots')).toHaveLength(1);
    expect(await rows('select title from public.health_articles')).toEqual([{ title: 'DEMO Published' }]);
    await db.exec(`reset role; update public.services set is_verified=false where id='${service}'; set role anon;`);
    expect(await rows('select id from public.facility_services')).toHaveLength(0);
    expect(await rows('select id from public.appointment_slots')).toHaveLength(0);
    await db.exec(`reset role; update public.services set is_verified=true where id='${service}'`);
  });
  it('rejects invalid capacities, duplicate active bookings, unsupported relationships and status inconsistencies', async () => {
    await expect(db.query('update public.appointment_slots set reserved_count=2')).rejects.toMatchObject({ code: '23514' });
    await expect(db.query(`insert into public.appointments(user_id,slot_id) values ('${alice}','${slot}')`)).rejects.toMatchObject({ code: '23505' });
    await expect(db.query("update public.appointments set status='cancelled'")).rejects.toMatchObject({ code: '23514' });
    await expect(db.query(`insert into public.facility_services(facility_id,service_id) values ('${facility}','00000000-0000-4000-8000-000000000099')`)).rejects.toMatchObject({ code: '23503' });
    await expect(db.query("insert into public.health_articles(category_id,title,body,published_at) values ('c1','DEMO Invalid','DEMO',now())")).rejects.toMatchObject({ code: '23514' });
  });
});

