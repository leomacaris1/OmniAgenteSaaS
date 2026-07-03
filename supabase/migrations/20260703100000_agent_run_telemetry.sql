alter table "AgentRun" add column if not exists "fallbackFrom" text;
alter table "AgentRun" add column if not exists "errorMessage" text;
alter table "AgentRun" add column if not exists "inputTokens" integer;
alter table "AgentRun" add column if not exists "outputTokens" integer;
alter table "AgentRun" add column if not exists "costUsd" double precision;
