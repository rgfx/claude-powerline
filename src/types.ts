export interface ClaudeHookData {
  hook_event_name: string;
  session_id: string;
  transcript_path: string;
  cwd: string;
  model: {
    id: string;
    display_name: string;
  };
  workspace: {
    current_dir: string;
    project_dir: string;
  };
}

export interface UsageMetrics {
  sessionCost: number;
  dailyCost: number;
  blockRemaining: number;
  blockCost: number;
  burnRate: number;
}

export type BurnRateLevel = 'low' | 'medium' | 'high';

export interface PowerlineColors {
  reset: string;
  modeBg: string;
  modeFg: string;
  modeSep: string;
  sessionBg: string;
  sessionFg: string;
  sessionSep: string;
  dailyBg: string;
  dailyFg: string;
  dailySep: string;
  blockBg: string;
  blockFg: string;
  blockSep: string;
  burnLowBg: string;
  burnMedBg: string;
  burnHighBg: string;
  burnFg: string;
  burnLowSep: string;
  burnMedSep: string;
  burnHighSep: string;
}

export interface BurnRateColors {
  bg: string;
  sep: string;
}