-- SSCONPAV · estrutura da nuvem (mesmo modelo do Funchal)
-- Cole no SQL Editor do projeto Supabase da SSCONPAV e clique em Run.
create table if not exists public.ssconpav_registros (
  uid text not null,
  org text not null default 'SSCONPAV',
  store text not null,
  dados jsonb not null default '{}'::jsonb,
  deletado boolean not null default false,
  atualizado_em timestamptz not null default now(),
  primary key (org, store, uid)
);
create index if not exists ssconpav_registros_sync_idx on public.ssconpav_registros (org, atualizado_em);
alter table public.ssconpav_registros enable row level security;
drop policy if exists ssconpav_registros_acesso on public.ssconpav_registros;
create policy ssconpav_registros_acesso on public.ssconpav_registros for all using (true) with check (true);

insert into storage.buckets (id, name, public) values ('ssconpav-fotos', 'ssconpav-fotos', true)
on conflict (id) do update set public = true;
drop policy if exists ssconpav_fotos_ler on storage.objects;
drop policy if exists ssconpav_fotos_enviar on storage.objects;
drop policy if exists ssconpav_fotos_trocar on storage.objects;
drop policy if exists ssconpav_fotos_apagar on storage.objects;
create policy ssconpav_fotos_ler    on storage.objects for select using (bucket_id = 'ssconpav-fotos');
create policy ssconpav_fotos_enviar on storage.objects for insert with check (bucket_id = 'ssconpav-fotos');
create policy ssconpav_fotos_trocar on storage.objects for update using (bucket_id = 'ssconpav-fotos') with check (bucket_id = 'ssconpav-fotos');
create policy ssconpav_fotos_apagar on storage.objects for delete using (bucket_id = 'ssconpav-fotos');
