export const DEFAULT_EXPOSED_SCHEMAS = ["public", "storage"];

export const CATALOG_SQL = `
with exposed_schemas as (
  select unnest($1::text[]) as schema_name
),
tables as (
  select
    n.nspname as schema_name,
    c.relname as table_name,
    c.relrowsecurity as rls_enabled
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  join exposed_schemas es on es.schema_name = n.nspname
  where c.relkind in ('r', 'p')
),
policies as (
  select
    schemaname as schema_name,
    tablename as table_name,
    count(*)::int as policy_count,
    bool_or(
      coalesce(qual, '') ilike '%user_metadata%'
      or coalesce(with_check, '') ilike '%user_metadata%'
      or coalesce(qual, '') ilike '%raw_user_meta_data%'
      or coalesce(with_check, '') ilike '%raw_user_meta_data%'
    ) as references_user_metadata
  from pg_policies
  group by schemaname, tablename
),
grants as (
  select
    table_schema as schema_name,
    table_name,
    grantee,
    string_agg(privilege_type, ',' order by privilege_type) as privileges
  from information_schema.role_table_grants
  where grantee in ('anon', 'authenticated')
  group by table_schema, table_name, grantee
),
functions as (
  select
    n.nspname as schema_name,
    p.proname as function_name,
    p.prosecdef as security_definer,
    has_function_privilege('anon', p.oid, 'EXECUTE') as anon_execute,
    has_function_privilege('authenticated', p.oid, 'EXECUTE') as authenticated_execute
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  join exposed_schemas es on es.schema_name = n.nspname
),
views as (
  select
    n.nspname as schema_name,
    c.relname as view_name,
    coalesce(
      (select option_value = 'true'
       from pg_options_to_table(c.reloptions)
       where option_name = 'security_invoker'),
      false
    ) as security_invoker
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  join exposed_schemas es on es.schema_name = n.nspname
  where c.relkind = 'v'
)
select jsonb_build_object(
  'tables', coalesce((select jsonb_agg(to_jsonb(t) || jsonb_build_object(
    'policy_count', coalesce(p.policy_count, 0),
    'references_user_metadata', coalesce(p.references_user_metadata, false)
  )) from tables t left join policies p using (schema_name, table_name)), '[]'::jsonb),
  'grants', coalesce((select jsonb_agg(to_jsonb(g)) from grants g), '[]'::jsonb),
  'functions', coalesce((select jsonb_agg(to_jsonb(f)) from functions f), '[]'::jsonb),
  'views', coalesce((select jsonb_agg(to_jsonb(v)) from views v), '[]'::jsonb)
) as audit_catalog;
`;
