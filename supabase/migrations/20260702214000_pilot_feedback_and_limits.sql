create table if not exists "PilotFeedback" (
  "id" text not null,
  "workspaceId" text not null,
  "userId" text not null,
  "projectId" text,
  "rating" integer,
  "message" text not null,
  "status" text not null default 'open',
  "createdAt" timestamp(3) not null default current_timestamp,
  constraint "PilotFeedback_pkey" primary key ("id")
);

create index if not exists "PilotFeedback_workspaceId_idx" on "PilotFeedback" ("workspaceId");
create index if not exists "PilotFeedback_projectId_idx" on "PilotFeedback" ("projectId");

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'PilotFeedback_workspaceId_fkey') then
    alter table "PilotFeedback" add constraint "PilotFeedback_workspaceId_fkey"
      foreign key ("workspaceId") references "Workspace" ("id") on delete cascade on update cascade;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'PilotFeedback_userId_fkey') then
    alter table "PilotFeedback" add constraint "PilotFeedback_userId_fkey"
      foreign key ("userId") references "AppUser" ("id") on delete cascade on update cascade;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'PilotFeedback_projectId_fkey') then
    alter table "PilotFeedback" add constraint "PilotFeedback_projectId_fkey"
      foreign key ("projectId") references "Project" ("id") on delete set null on update cascade;
  end if;
end $$;

alter table "PilotFeedback" enable row level security;
