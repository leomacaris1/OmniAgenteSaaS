do $$
declare
  fallback_workspace_id text;
begin
  if exists (select 1 from "Project" where "workspaceId" is null) then
    select "id"
      into fallback_workspace_id
      from "Workspace"
      order by "createdAt" asc
      limit 1;

    if fallback_workspace_id is null then
      fallback_workspace_id := 'workspace-default';

      insert into "Workspace" ("id", "name", "plan", "createdAt", "updatedAt")
      values (fallback_workspace_id, 'Default workspace', 'founding-pilot', now(), now())
      on conflict ("id") do nothing;
    end if;

    update "Project"
      set "workspaceId" = fallback_workspace_id
      where "workspaceId" is null;
  end if;
end $$;

alter table "Project"
  alter column "workspaceId" set not null;

alter table "Project"
  drop constraint if exists "Project_workspaceId_fkey";

alter table "Project"
  add constraint "Project_workspaceId_fkey"
  foreign key ("workspaceId") references "Workspace" ("id")
  on delete restrict
  on update cascade;
