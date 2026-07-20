-- Supabase SQL Editor에서 한 번 실행하세요 (Project → SQL Editor → New query → 붙여넣고 Run).
-- 이 앱의 백엔드는 service_role 키로만 접속하므로, RLS를 켜고 별도 정책을 만들지 않으면
-- anon/authenticated 키로는 아무것도 조회/변경할 수 없고, service_role만 (RLS 우회) 접근 가능합니다.

create table if not exists task_templates (
  id bigint generated always as identity primary key,
  title text not null unique,
  description text,
  use_count integer not null default 0,
  last_used_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists tasks (
  id bigint generated always as identity primary key,
  title text not null,
  description text,
  status text not null default 'todo' check (status in ('todo', 'done')),
  due_date date,
  template_id bigint references task_templates(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  completed_at timestamptz
);

create table if not exists tags (
  id bigint generated always as identity primary key,
  name text not null unique,
  color text
);

create table if not exists task_tags (
  task_id bigint not null references tasks(id) on delete cascade,
  tag_id bigint not null references tags(id) on delete cascade,
  primary key (task_id, tag_id)
);

create index if not exists idx_tasks_status on tasks(status);
create index if not exists idx_tasks_template_id on tasks(template_id);
create index if not exists idx_tasks_due_date on tasks(due_date);
create index if not exists idx_task_tags_tag_id on task_tags(tag_id);

-- Row Level Security: 켜기만 하고 정책은 만들지 않음 → 기본적으로 전체 차단, service_role만 예외.
alter table task_templates enable row level security;
alter table tasks enable row level security;
alter table tags enable row level security;
alter table task_tags enable row level security;

-- 아래 3개 함수는 "할 일 생성 + 태그 연결", "프리셋 사용", "태그 재설정"을 각각 원자적으로 처리한다.
-- (better-sqlite3의 db.transaction()을 대체)

create or replace function create_task_with_tags(
  p_title text,
  p_description text,
  p_due_date date,
  p_template_id bigint,
  p_tag_ids bigint[]
) returns tasks
language plpgsql
security invoker
as $$
declare
  v_task tasks;
begin
  insert into tasks (title, description, due_date, template_id)
  values (p_title, p_description, p_due_date, p_template_id)
  returning * into v_task;

  if p_tag_ids is not null and array_length(p_tag_ids, 1) > 0 then
    insert into task_tags (task_id, tag_id)
    select v_task.id, unnest(p_tag_ids)
    on conflict do nothing;
  end if;

  return v_task;
end;
$$;

create or replace function use_template(p_template_id bigint) returns tasks
language plpgsql
security invoker
as $$
declare
  v_template task_templates;
  v_task tasks;
begin
  select * into v_template from task_templates where id = p_template_id;
  if not found then
    raise exception 'template not found';
  end if;

  insert into tasks (title, description, due_date, template_id)
  values (v_template.title, v_template.description, current_date, v_template.id)
  returning * into v_task;

  update task_templates
  set use_count = use_count + 1, last_used_at = now()
  where id = p_template_id;

  return v_task;
end;
$$;

create or replace function set_task_tags(p_task_id bigint, p_tag_ids bigint[]) returns void
language plpgsql
security invoker
as $$
begin
  delete from task_tags where task_id = p_task_id;
  if p_tag_ids is not null and array_length(p_tag_ids, 1) > 0 then
    insert into task_tags (task_id, tag_id)
    select p_task_id, unnest(p_tag_ids)
    on conflict do nothing;
  end if;
end;
$$;

revoke all on function create_task_with_tags(text, text, date, bigint, bigint[]) from public;
revoke all on function use_template(bigint) from public;
revoke all on function set_task_tags(bigint, bigint[]) from public;
grant execute on function create_task_with_tags(text, text, date, bigint, bigint[]) to service_role;
grant execute on function use_template(bigint) to service_role;
grant execute on function set_task_tags(bigint, bigint[]) to service_role;
