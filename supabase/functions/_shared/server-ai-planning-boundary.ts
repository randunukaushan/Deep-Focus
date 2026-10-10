/** Server-only AI planning lifecycle; provider credentials stay outside this module. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { confirmPlanProposal } from '../../../src/features/planning/ai-planner.ts';
import type { AiPlanningProvider, ConfirmedPlan, PlanProposal, PlanningRequest } from '../../../src/features/planning/ai-planner.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type UsageService = {
  reserve: (input: {
    verifiedActorId: string;
    sessionId: string;
    capability: 'ai';
    periodKey: string;
    units: number;
    receiptId: string;
    now: string;
  }) => Promise<{ allowed: boolean }>;
  settle: (input: {
    verifiedActorId: string;
    sessionId: string;
    receiptId: string;
    action: 'consume' | 'release';
  }) => Promise<{ allowed: boolean; status?: 'consumed' | 'released' }>;
};

function invalid(): never { throw new SafeBoundaryError(422, 'VALIDATION_FAILED'); }

function validateContext(input: { verifiedActorId: string; sessionId: string; periodKey: string; receiptId: string; now: string }): void {
  if (!UUID.test(input.verifiedActorId) || !UUID.test(input.sessionId) || !UUID.test(input.receiptId)
    || typeof input.periodKey !== 'string' || !input.periodKey.trim() || !Number.isFinite(Date.parse(input.now))) invalid();
}

export function createServerAiPlanningBoundary(input: {
  provider: AiPlanningProvider;
  usage: UsageService;
  recheckSession: (verifiedActorId: string, sessionId: string) => Promise<void>;
  applyConfirmed: (value: { verifiedActorId: string; sessionId: string; plan: ConfirmedPlan }) => Promise<void>;
}) {
  if (!input.provider || typeof input.provider.createProposal !== 'function'
    || !input.usage || typeof input.usage.reserve !== 'function' || typeof input.usage.settle !== 'function'
    || typeof input.recheckSession !== 'function'
    || typeof input.applyConfirmed !== 'function') invalid();

  return {
    async createProposal(value: {
      verifiedActorId: string;
      sessionId: string;
      periodKey: string;
      receiptId: string;
      now: string;
      request: PlanningRequest;
    }): Promise<PlanProposal> {
      validateContext(value);
      let reserved: { allowed: boolean };
      try {
        reserved = await input.usage.reserve({
          verifiedActorId: value.verifiedActorId, sessionId: value.sessionId, capability: 'ai',
          periodKey: value.periodKey, units: 1, receiptId: value.receiptId, now: value.now,
        });
      } catch (error) {
        if (error instanceof SafeBoundaryError) throw error;
        throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE');
      }
      if (!reserved.allowed) throw new SafeBoundaryError(429, 'AI_ALLOWANCE_EXCEEDED');
      try {
        const proposal = await input.provider.createProposal(value.request);
        const settled = await input.usage.settle({ verifiedActorId: value.verifiedActorId, sessionId: value.sessionId, receiptId: value.receiptId, action: 'consume' });
        if (!settled.allowed || settled.status !== 'consumed') throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE');
        return proposal;
      } catch {
        try {
          const released = await input.usage.settle({ verifiedActorId: value.verifiedActorId, sessionId: value.sessionId, receiptId: value.receiptId, action: 'release' });
          if (!released.allowed || released.status !== 'released') throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE');
        } catch {
          throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE');
        }
        throw new SafeBoundaryError(503, 'AI_PROVIDER_UNAVAILABLE');
      }
    },
    async applyConfirmed(value: {
      verifiedActorId: string;
      sessionId: string;
      proposal: PlanProposal;
      confirmationToken: string;
      confirmedAt: string;
    }): Promise<ConfirmedPlan> {
      if (!UUID.test(value.verifiedActorId) || !UUID.test(value.sessionId)) invalid();
      let plan: ConfirmedPlan;
      try { plan = confirmPlanProposal(value.proposal, value.confirmationToken, value.confirmedAt); } catch { invalid(); }
      try {
        await input.recheckSession(value.verifiedActorId, value.sessionId);
      } catch (error) {
        if (error instanceof SafeBoundaryError) throw error;
        throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE');
      }
      try {
        await input.applyConfirmed({ verifiedActorId: value.verifiedActorId, sessionId: value.sessionId, plan });
      } catch (error) {
        if (error instanceof SafeBoundaryError) throw error;
        throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE');
      }
      return plan;
    },
  };
}
