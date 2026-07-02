create table if not exists "AppUser" (
  "id" text not null,
  "email" text not null,
  "passwordHash" text not null,
  "name" text,
  "createdAt" timestamp(3) not null default current_timestamp,
  "updatedAt" timestamp(3) not null default current_timestamp,
  constraint "AppUser_pkey" primary key ("id")
);

create unique index if not exists "AppUser_email_key" on "AppUser" ("email");

create table if not exists "Workspace" (
  "id" text not null,
  "name" text not null,
  "createdAt" timestamp(3) not null default current_timestamp,
  "updatedAt" timestamp(3) not null default current_timestamp,
  constraint "Workspace_pkey" primary key ("id")
);

create table if not exists "WorkspaceMember" (
  "id" text not null,
  "userId" text not null,
  "workspaceId" text not null,
  "role" text not null default 'owner',
  "createdAt" timestamp(3) not null default current_timestamp,
  constraint "WorkspaceMember_pkey" primary key ("id")
);

create unique index if not exists "WorkspaceMember_userId_workspaceId_key"
  on "WorkspaceMember" ("userId", "workspaceId");
create index if not exists "WorkspaceMember_workspaceId_idx"
  on "WorkspaceMember" ("workspaceId");

create table if not exists "UserSession" (
  "id" text not null,
  "userId" text not null,
  "tokenHash" text not null,
  "expiresAt" timestamp(3) not null,
  "createdAt" timestamp(3) not null default current_timestamp,
  "lastSeenAt" timestamp(3) not null default current_timestamp,
  constraint "UserSession_pkey" primary key ("id")
);

create unique index if not exists "UserSession_tokenHash_key" on "UserSession" ("tokenHash");
create index if not exists "UserSession_userId_idx" on "UserSession" ("userId");
create index if not exists "UserSession_expiresAt_idx" on "UserSession" ("expiresAt");

alter table "Project" add column if not exists "workspaceId" text;
create index if not exists "Project_workspaceId_idx" on "Project" ("workspaceId");

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'Project_workspaceId_fkey') then
    alter table "Project" add constraint "Project_workspaceId_fkey"
      foreign key ("workspaceId") references "Workspace" ("id") on delete cascade on update cascade;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'WorkspaceMember_userId_fkey') then
    alter table "WorkspaceMember" add constraint "WorkspaceMember_userId_fkey"
      foreign key ("userId") references "AppUser" ("id") on delete cascade on update cascade;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'WorkspaceMember_workspaceId_fkey') then
    alter table "WorkspaceMember" add constraint "WorkspaceMember_workspaceId_fkey"
      foreign key ("workspaceId") references "Workspace" ("id") on delete cascade on update cascade;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'UserSession_userId_fkey') then
    alter table "UserSession" add constraint "UserSession_userId_fkey"
      foreign key ("userId") references "AppUser" ("id") on delete cascade on update cascade;
  end if;
end $$;

alter table "AppUser" enable row level security;
alter table "Workspace" enable row level security;
alter table "WorkspaceMember" enable row level security;
alter table "UserSession" enable row level security;
alter table "Project" enable row level security;
alter table "AgentRun" enable row level security;
alter table "GeneratedArtifact" enable row level security;
alter table "PromptVersion" enable row level security;
