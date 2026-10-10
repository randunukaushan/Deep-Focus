import type { Task } from '@/features/tasks/task-types';

export type PlanningTaskInput = Pick<Task, 'id' | 'title' | 'status'> & {
  dueAt?: string;
  priority?: Task['priority'];
};

export type PlanningRequest = {
  model: string;
  availableMinutes: number;
  tasks: PlanningTaskInput[];
  createdAt: string;
};

export type PlanProposalItem = {
  taskId: string;
  position: number;
  focusDurationSeconds: number;
  breakDurationSeconds: number;
};

export type PlanProposal = {
  id: string;
  provider: 'mock' | 'openai';
  model: string;
  createdAt: string;
  items: PlanProposalItem[];
  requiresConfirmation: true;
};

export type ConfirmedPlan = PlanProposal & {
  confirmedAt: string;
  confirmed: true;
};

export type AiPlanningProvider = {
  createProposal(request: PlanningRequest): Promise<PlanProposal>;
};

export type OpenAiPlanningTransport = (request: PlanningRequest) => Promise<unknown>;

function validTimestamp(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0 && Number.isFinite(Date.parse(value));
}

function validateRequest(request: PlanningRequest) {
  if (!request || typeof request.model !== 'string' || !request.model.trim() || request.model.length > 120
    || !Number.isSafeInteger(request.availableMinutes) || request.availableMinutes < 25 || request.availableMinutes > 720
    || !validTimestamp(request.createdAt) || !Array.isArray(request.tasks) || request.tasks.length === 0 || request.tasks.length > 50) {
    throw new RangeError('INVALID_PLANNING_REQUEST: model, time, timestamp and tasks are invalid');
  }
  const ids = new Set<string>();
  for (const task of request.tasks) {
    if (typeof task.id !== 'string' || !task.id.trim() || task.id.length > 128 || ids.has(task.id)
      || typeof task.title !== 'string' || !task.title.trim() || task.title.length > 120
      || !['pending', 'in_progress'].includes(task.status)) {
      throw new RangeError('INVALID_PLANNING_REQUEST: task input is invalid');
    }
    ids.add(task.id);
  }
}

function proposalId(provider: PlanProposal['provider'], request: PlanningRequest, items: PlanProposalItem[]): string {
  return `${provider}-plan:${request.model}:${request.createdAt}:${items.map((item) => item.taskId).join(',')}`;
}

/** Deterministic local stand-in. It never calls a provider or mutates tasks. */
export function createMockAiPlanningProvider(): AiPlanningProvider {
  return {
    async createProposal(request) {
      validateRequest(request);
      const blockCount = Math.max(1, Math.min(request.tasks.length, Math.floor(request.availableMinutes / 30)));
      const items = request.tasks.slice(0, blockCount).map((task, index) => ({
        taskId: task.id,
        position: index,
        focusDurationSeconds: 25 * 60,
        breakDurationSeconds: 5 * 60,
      }));
      return {
        id: proposalId('mock', request, items), provider: 'mock', model: request.model,
        createdAt: request.createdAt, items, requiresConfirmation: true,
      };
    },
  };
}

function parseOpenAiProposal(request: PlanningRequest, payload: unknown): PlanProposal {
  if (!payload || typeof payload !== 'object' || !Array.isArray((payload as { items?: unknown }).items)) {
    throw new Error('AI_RESPONSE_INVALID: structured plan items are missing');
  }
  const rawItems = (payload as { items: unknown[] }).items;
  const taskIds = new Set(request.tasks.map((task) => task.id));
  if (rawItems.length === 0 || rawItems.length > request.tasks.length) throw new Error('AI_RESPONSE_INVALID: item count is invalid');
  const items = rawItems.map((raw, index): PlanProposalItem => {
    if (!raw || typeof raw !== 'object') throw new Error('AI_RESPONSE_INVALID: item is not an object');
    const item = raw as Partial<PlanProposalItem>;
    const focusDurationSeconds = item.focusDurationSeconds;
    const breakDurationSeconds = item.breakDurationSeconds;
    if (typeof item.taskId !== 'string' || !taskIds.has(item.taskId)
      || item.position !== index
      || typeof focusDurationSeconds !== 'number' || !Number.isSafeInteger(focusDurationSeconds) || focusDurationSeconds < 60 || focusDurationSeconds > 43_200
      || typeof breakDurationSeconds !== 'number' || !Number.isSafeInteger(breakDurationSeconds) || breakDurationSeconds < 0 || breakDurationSeconds > 3_600) {
      throw new Error('AI_RESPONSE_INVALID: item bounds or task identity are invalid');
    }
    return { taskId: item.taskId, position: item.position, focusDurationSeconds, breakDurationSeconds };
  });
  if (new Set(items.map((item) => item.taskId)).size !== items.length) throw new Error('AI_RESPONSE_INVALID: duplicate task');
  return {
    id: proposalId('openai', request, items), provider: 'openai', model: request.model,
    createdAt: request.createdAt, items, requiresConfirmation: true,
  };
}

/**
 * Provider boundary only. The transport belongs on reviewed trusted
 * infrastructure; this module never reads a key, calls the network or applies
 * the proposal to tasks.
 */
export function createOpenAiPlanningProvider(transport: OpenAiPlanningTransport): AiPlanningProvider {
  return {
    async createProposal(request) {
      validateRequest(request);
      if (typeof transport !== 'function') throw new Error('AI_PROVIDER_NOT_CONFIGURED');
      return parseOpenAiProposal(request, await transport(request));
    },
  };
}

export function confirmationToken(proposal: PlanProposal): string {
  if (!['mock', 'openai'].includes(proposal.provider) || proposal.requiresConfirmation !== true || !proposal.id) {
    throw new RangeError('INVALID_PLAN_PROPOSAL: confirmation is not available');
  }
  return proposal.id;
}

/** Confirmation only changes the caller's plan state; it does not apply tasks. */
export function confirmPlanProposal(proposal: PlanProposal, token: string, confirmedAt: string): ConfirmedPlan {
  if (token !== confirmationToken(proposal) || !validTimestamp(confirmedAt) || confirmedAt < proposal.createdAt) {
    throw new RangeError('INVALID_PLAN_CONFIRMATION: proposal token or timestamp is invalid');
  }
  return { ...proposal, confirmedAt, confirmed: true };
}
