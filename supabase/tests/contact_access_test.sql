-- Run after 202611110001_accepted_contact.sql as a database administrator.
-- All identities and service data are temporary because this transaction rolls back.
begin;

do $$
declare
  client_id uuid := gen_random_uuid();
  professional_id uuid := gen_random_uuid();
  outsider_id uuid := gen_random_uuid();
  request_id uuid;
  quote_id uuid;
begin
  insert into auth.users
    (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
     raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values
    ('00000000-0000-0000-0000-000000000000', client_id, 'authenticated', 'authenticated',
     'contact-client-' || client_id || '@manocerca.invalid', 'test-only', now(),
     '{"provider":"email","providers":["email"]}'::jsonb,
     '{"role":"client","full_name":"Cliente A","phone":"900000001","zone":"Cercado"}'::jsonb, now(), now()),
    ('00000000-0000-0000-0000-000000000000', professional_id, 'authenticated', 'authenticated',
     'contact-master-' || professional_id || '@manocerca.invalid', 'test-only', now(),
     '{"provider":"email","providers":["email"]}'::jsonb,
     '{"role":"professional","full_name":"Maestro B","phone":"900000002","zone":"Cercado","specialty":"Gasfitería"}'::jsonb, now(), now()),
    ('00000000-0000-0000-0000-000000000000', outsider_id, 'authenticated', 'authenticated',
     'contact-outsider-' || outsider_id || '@manocerca.invalid', 'test-only', now(),
     '{"provider":"email","providers":["email"]}'::jsonb,
     '{"role":"client","full_name":"Tercero C","phone":"900000003","zone":"Cercado"}'::jsonb, now(), now());

  if not exists (select 1 from public.profiles where id = client_id and role = 'client')
     or not exists (select 1 from public.professionals where id = professional_id)
     or not exists (select 1 from public.profiles where id = outsider_id) then
    raise exception 'FALLÓ: no se crearon los tres perfiles de prueba';
  end if;

  insert into public.service_requests
    (client_id, specialty, title, description, address, zone, latitude, longitude, status)
  values
    (client_id, 'Gasfitería', 'Prueba de contacto', 'Solicitud temporal para probar acceso a contactos.',
     'Dirección de prueba', 'Cercado', -16.3989, -71.5350, 'QUOTED')
  returning id into request_id;

  insert into public.quotes (request_id, professional_id, version, price, description, status)
  values (request_id, professional_id, 1, 50, 'Cotización de prueba', 'PENDING')
  returning id into quote_id;

  perform set_config('contact_test.client_id', client_id::text, true);
  perform set_config('contact_test.professional_id', professional_id::text, true);
  perform set_config('contact_test.outsider_id', outsider_id::text, true);
  perform set_config('contact_test.request_id', request_id::text, true);
  perform set_config('contact_test.quote_id', quote_id::text, true);
end $$;

set local role authenticated;
select set_config('request.jwt.claim.sub', current_setting('contact_test.client_id'), true);
do $$ begin
  if exists (select 1 from public.get_accepted_contact(current_setting('contact_test.request_id')::uuid)) then
    raise exception 'FALLÓ: A vio nombre/teléfono de B antes de aceptar';
  end if;
end $$;

select set_config('request.jwt.claim.sub', current_setting('contact_test.professional_id'), true);
do $$ begin
  if exists (select 1 from public.get_accepted_contact(current_setting('contact_test.request_id')::uuid)) then
    raise exception 'FALLÓ: B vio nombre/teléfono de A antes de aceptar';
  end if;
end $$;

select set_config('request.jwt.claim.sub', current_setting('contact_test.outsider_id'), true);
do $$ begin
  if exists (select 1 from public.get_accepted_contact(current_setting('contact_test.request_id')::uuid))
     or exists (select 1 from public.profiles where id in
       (current_setting('contact_test.client_id')::uuid, current_setting('contact_test.professional_id')::uuid)) then
    raise exception 'FALLÓ: C vio datos de A o B antes de aceptar';
  end if;
end $$;

select set_config('request.jwt.claim.sub', current_setting('contact_test.client_id'), true);
select public.decide_quote(current_setting('contact_test.quote_id')::uuid, true);

do $$ begin
  if (select count(*) from public.get_accepted_contact(current_setting('contact_test.request_id')::uuid)) <> 1
     or not exists (
       select 1 from public.get_accepted_contact(current_setting('contact_test.request_id')::uuid)
       where id = current_setting('contact_test.professional_id')::uuid
         and full_name = 'Maestro B' and phone = '900000002'
     ) then
    raise exception 'FALLÓ: A no pudo ver nombre y teléfono de B tras aceptar';
  end if;
end $$;

select set_config('request.jwt.claim.sub', current_setting('contact_test.professional_id'), true);
do $$ begin
  if (select count(*) from public.get_accepted_contact(current_setting('contact_test.request_id')::uuid)) <> 1
     or not exists (
       select 1 from public.get_accepted_contact(current_setting('contact_test.request_id')::uuid)
       where id = current_setting('contact_test.client_id')::uuid
         and full_name = 'Cliente A' and phone = '900000001'
     ) then
    raise exception 'FALLÓ: B no pudo ver nombre y teléfono de A tras aceptar';
  end if;
end $$;

select set_config('request.jwt.claim.sub', current_setting('contact_test.outsider_id'), true);
do $$ begin
  if exists (select 1 from public.get_accepted_contact(current_setting('contact_test.request_id')::uuid))
     or exists (select 1 from public.profiles where id in
       (current_setting('contact_test.client_id')::uuid, current_setting('contact_test.professional_id')::uuid)) then
    raise exception 'FALLÓ: C vio datos de A o B tras aceptar';
  end if;
end $$;

reset role;
rollback;
