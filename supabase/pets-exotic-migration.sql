-- Migração incremental para o cadastro de pets com animais exóticos.
-- Use este arquivo se o schema principal já foi executado antes.
-- Ele não apaga dados e só adiciona colunas que ainda não existem.

alter table public.pets
  add column if not exists animal_group text;

alter table public.pets
  add column if not exists specific_species text;

alter table public.pets
  add column if not exists subspecies_or_morph text;

alter table public.pets
  add column if not exists sex text;

alter table public.pets
  add column if not exists weight_unit text;
