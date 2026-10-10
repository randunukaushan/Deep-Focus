export type SriLankaEducationStage = 'ol' | 'al' | 'higher';

export type EducationMetadata = {
  country: 'LK';
  stage: SriLankaEducationStage;
  subject?: string;
  topic?: string;
  examContext?: string;
};

export type EducationMetadataResult =
  | { valid: true; value: EducationMetadata }
  | { valid: false; reason: 'invalid_data' | 'unsupported_country' | 'unsupported_stage' };

const MAX_TEXT = 120;

function boundedText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= MAX_TEXT && !/[\u0000-\u001f\u007f]/.test(value);
}

/** Validates optional Sri Lankan study context without supplying teaching material. */
export function validateEducationMetadata(input: unknown): EducationMetadataResult {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return { valid: false, reason: 'invalid_data' };
  const candidate = input as Record<string, unknown>;
  if (candidate.country !== 'LK') return { valid: false, reason: 'unsupported_country' };
  if (!['ol', 'al', 'higher'].includes(String(candidate.stage))) return { valid: false, reason: 'unsupported_stage' };
  for (const key of ['subject', 'topic', 'examContext']) {
    if (candidate[key] !== undefined && !boundedText(candidate[key])) return { valid: false, reason: 'invalid_data' };
  }
  return {
    valid: true,
    value: {
      country: 'LK',
      stage: candidate.stage as SriLankaEducationStage,
      ...(candidate.subject === undefined ? {} : { subject: (candidate.subject as string).trim() }),
      ...(candidate.topic === undefined ? {} : { topic: (candidate.topic as string).trim() }),
      ...(candidate.examContext === undefined ? {} : { examContext: (candidate.examContext as string).trim() }),
    },
  };
}
