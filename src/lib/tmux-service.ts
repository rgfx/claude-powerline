import { execSync } from "node:child_process";

export class TmuxService {
  getSessionId(): string | null {
    try {
      if (!process.env.TMUX_PANE) {
        return null;
      }

      const sessionId = execSync("tmux display-message -p '#S'", {
        encoding: "utf8",
        timeout: 1000,
      }).trim();

      return sessionId || null;
    } catch {
      return null;
    }
  }

  isInTmux(): boolean {
    return !!process.env.TMUX_PANE;
  }
}
