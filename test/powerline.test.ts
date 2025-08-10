import { PowerlineRenderer } from "../src/powerline";
import type { ClaudeHookData } from "../src/types";

jest.mock("ccusage/data-loader", () => ({
  loadSessionUsageById: jest.fn().mockResolvedValue({ totalCost: 0.05 }),
  loadDailyUsageData: jest.fn().mockResolvedValue([{}]),
  getClaudePaths: jest.fn().mockReturnValue(["/mock/path"]),
}));

jest.mock("ccusage/calculate-cost", () => ({
  calculateTotals: jest.fn().mockReturnValue({ totalCost: 1.25 }),
}));

jest.mock("ccusage/logger", () => ({
  logger: { level: 2 },
}));

jest.mock("node:child_process", () => ({
  execSync: jest.fn((cmd: string) => {
    if (cmd.includes("git branch --show-current")) {
      return "main\n";
    }
    if (cmd.includes("git status --porcelain")) {
      return "";
    }
    if (cmd.includes("git rev-list --count")) {
      return "0\n";
    }
    return "";
  }),
}));

describe("PowerlineRenderer", () => {
  let renderer: PowerlineRenderer;

  beforeEach(() => {
    renderer = new PowerlineRenderer();
  });

  const mockHookData: ClaudeHookData = {
    hook_event_name: "Status",
    session_id: "abc123def456ghi789",
    transcript_path: "/path/to/transcript.json",
    cwd: "/current/working/directory",
    model: {
      id: "claude-opus-4-1",
      display_name: "Opus",
    },
    workspace: {
      current_dir: "/current/working/directory",
      project_dir: "/original/project/directory",
    },
  };

  const mockHookDataWithSameDir: ClaudeHookData = {
    hook_event_name: "Status",
    session_id: "xyz789uvw456rst123",
    transcript_path: "/path/to/transcript2.json",
    cwd: "/home/user/myproject",
    model: {
      id: "claude-sonnet-3-5",
      display_name: "Claude 3.5 Sonnet",
    },
    workspace: {
      current_dir: "/home/user/myproject",
      project_dir: "/home/user/myproject",
    },
  };

  const mockHookDataNoGit: ClaudeHookData = {
    hook_event_name: "Status",
    session_id: "nogit123456789",
    transcript_path: "/path/to/transcript3.json",
    cwd: "/tmp/nogit",
    model: {
      id: "claude-haiku-3",
      display_name: "Haiku",
    },
    workspace: {
      current_dir: "/tmp/nogit",
      project_dir: "/tmp/nogit",
    },
  };

  describe("generateStatusline", () => {
    it("should generate statusline with git info and costs", async () => {
      const statusline = await renderer.generateStatusline(
        mockHookData,
        "colors"
      );

      expect(statusline).toBeDefined();
      expect(statusline).toContain("directory");
      expect(statusline).toContain("main");
      expect(statusline).toContain("Opus");
      expect(statusline).toContain("Session");
      expect(statusline).toContain("Today");
      expect(statusline).toContain("$");
    });

    it("should generate statusline with dark theme", async () => {
      const statusline = await renderer.generateStatusline(
        mockHookData,
        "dark"
      );

      expect(statusline).toBeDefined();
      expect(statusline).toContain("Opus");
      expect(statusline).toContain("main");
    });

    it("should handle same current and project directory", async () => {
      const statusline = await renderer.generateStatusline(
        mockHookDataWithSameDir,
        "colors"
      );

      expect(statusline).toBeDefined();
      expect(statusline).toContain("myproject");
      expect(statusline).toContain("Claude 3.5 Sonnet");
    });

    it("should handle missing git info gracefully", async () => {
      const mockExecSync = require("node:child_process").execSync as jest.Mock;
      mockExecSync.mockImplementation(() => {
        throw new Error("Not a git repository");
      });

      const statusline = await renderer.generateStatusline(
        mockHookDataNoGit,
        "colors"
      );

      expect(statusline).toBeDefined();
      expect(statusline).toContain("Haiku");
      expect(statusline).toContain("nogit");
      expect(statusline).not.toContain("main");
      mockExecSync.mockImplementation((cmd: string) => {
        if (cmd.includes("git branch --show-current")) return "main\n";
        if (cmd.includes("git status --porcelain")) return "";
        if (cmd.includes("git rev-list --count")) return "0\n";
        return "";
      });
    });

    it("should contain powerline separators", async () => {
      const statusline = await renderer.generateStatusline(
        mockHookData,
        "colors"
      );

      expect(statusline).toContain("\uE0B0");
    });

    it("should contain ANSI color codes", async () => {
      const statusline = await renderer.generateStatusline(
        mockHookData,
        "colors"
      );

      expect(statusline).toContain("\x1b[");
    });

    it("should format costs correctly", async () => {
      const statusline = await renderer.generateStatusline(
        mockHookData,
        "colors"
      );

      expect(statusline).toContain("$0.05");
      expect(statusline).toContain("$1.25");
    });
  });

  describe("edge cases", () => {
    it("should handle missing model display name", async () => {
      const hookDataNoModel = {
        ...mockHookData,
        model: {} as any,
      };

      const statusline = await renderer.generateStatusline(
        hookDataNoModel,
        "colors"
      );
      expect(statusline).toContain("Claude");
    });

    it("should handle missing workspace", async () => {
      const hookDataNoWorkspace = {
        ...mockHookData,
        workspace: undefined as any,
      };

      const statusline = await renderer.generateStatusline(
        hookDataNoWorkspace,
        "colors"
      );
      expect(statusline).toBeDefined();
    });
  });
});
