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

export interface PowerlineColors {
  reset: string;
  modeBg: string;
  modeFg: string;
  sessionBg: string;
  sessionFg: string;
  dailyBg: string;
  dailyFg: string;
  blockBg: string;
  blockFg: string;
  burnLowBg: string;
  burnFg: string;
}
