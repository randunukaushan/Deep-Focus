-- Add covering indexes for owner-bound foreign-key enforcement and deletes.
-- This migration is additive: it does not change grants, RLS, or table data.
begin;

create index if not exists ai_generation_requests_owner_proposal_fk
  on df_private.ai_generation_requests (owner_id, proposal_id);
create index if not exists ai_generation_requests_owner_reservation_fk
  on df_private.ai_generation_requests (owner_id, reservation_id);
create index if not exists ai_plan_blocks_owner_reminder_fk
  on df_private.ai_plan_blocks (owner_id, reminder_id);
create index if not exists ai_plan_blocks_owner_task_fk
  on df_private.ai_plan_blocks (owner_id, task_id);
create index if not exists ai_plans_owner_generation_request_fk
  on df_private.ai_plans (owner_id, generation_request_id);
create index if not exists ai_plans_owner_workspace_fk
  on df_private.ai_plans (owner_id, workspace_id);
create index if not exists app_session_revocation_outbox_session_fk
  on df_private.app_session_revocation_outbox (session_id);
create index if not exists focus_sessions_owner_workspace_fk
  on df_private.focus_sessions (owner_id, workspace_id);
create index if not exists focus_sessions_owner_workspace_task_fk
  on df_private.focus_sessions (owner_id, workspace_id, task_id);
create index if not exists task_reminders_owner_task_fk
  on df_private.task_reminders (owner_id, task_id);
create index if not exists tasks_owner_workspace_goal_fk
  on df_private.tasks (owner_id, workspace_id, goal_id);
create index if not exists usage_receipts_owner_capability_period_fk
  on df_private.usage_reservation_receipts (owner_id, capability, period_key);

commit;
