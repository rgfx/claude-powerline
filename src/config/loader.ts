import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import type { PowerlineConfig, ConfigLoadOptions } from "../types/config";
import { DEFAULT_CONFIG } from "./defaults";

function deepMerge<T extends Record<string, any>>(
  target: T,
  source: Partial<T>
): T {
  const result = { ...target };

  for (const key in source) {
    if (source[key] !== undefined) {
      if (
        typeof source[key] === "object" &&
        source[key] !== null &&
        !Array.isArray(source[key])
      ) {
        result[key] = deepMerge(result[key] || ({} as any), source[key] as any);
      } else {
        result[key] = source[key] as any;
      }
    }
  }

  return result;
}

function findConfigFile(customPath?: string): string | null {
  if (customPath) {
    return fs.existsSync(customPath) ? customPath : null;
  }

  const locations = [
    path.join(process.cwd(), ".claude-powerline.json"),
    path.join(os.homedir(), ".claude", "claude-powerline.json"),
    path.join(os.homedir(), ".config", "claude-powerline", "config.json"),
  ];

  return locations.find(fs.existsSync) || null;
}

function loadConfigFile(filePath: string): Partial<PowerlineConfig> {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    throw new Error(
      `Failed to load config file ${filePath}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

function loadEnvConfig(): Partial<PowerlineConfig> {
  const config: Partial<PowerlineConfig> = {};

  if (process.env.CLAUDE_POWERLINE_THEME) {
    config.theme = process.env.CLAUDE_POWERLINE_THEME as
      | "light"
      | "dark"
      | "custom";
  }

  if (process.env.CLAUDE_POWERLINE_USAGE_TYPE) {
    const usageType = process.env.CLAUDE_POWERLINE_USAGE_TYPE as
      | "cost"
      | "tokens"
      | "both"
      | "breakdown";
    config.display = config.display || { lines: [] };

    if (config.display.lines.length === 0) {
      config.display.lines = [{ segments: {} }];
    }

    config.display.lines.forEach((line) => {
      if (line.segments.session) {
        line.segments.session.type = usageType;
      }
      if (line.segments.today) {
        line.segments.today.type = usageType;
      }
      if (line.segments.block) {
        line.segments.block.type =
          usageType === "breakdown" || usageType === "both"
            ? "cost"
            : usageType;
      }
    });
  }

  return config;
}

function getConfigPathFromEnv(): string | undefined {
  return process.env.CLAUDE_POWERLINE_CONFIG;
}

function parseCLIOverrides(args: string[]): Partial<PowerlineConfig> {
  const config: Partial<PowerlineConfig> = {};

  const themeIndex = args.findIndex((arg) => arg.startsWith("--theme="));
  if (themeIndex !== -1) {
    const theme = args[themeIndex]?.split("=")[1];
    if (theme) {
      config.theme = theme as "light" | "dark" | "custom";
    }
  }

  const dailyBudgetIndex = args.findIndex((arg) =>
    arg.startsWith("--daily-budget=")
  );
  if (dailyBudgetIndex !== -1) {
    const dailyBudget = parseFloat(args[dailyBudgetIndex]?.split("=")[1] || "");
    if (!isNaN(dailyBudget) && dailyBudget > 0) {
      config.budget = {
        ...config.budget,
        today: {
          ...DEFAULT_CONFIG.budget?.today,
          amount: dailyBudget,
        },
      };
    }
  }

  const sessionBudgetIndex = args.findIndex((arg) =>
    arg.startsWith("--session-budget=")
  );
  if (sessionBudgetIndex !== -1) {
    const sessionBudget = parseFloat(
      args[sessionBudgetIndex]?.split("=")[1] || ""
    );
    if (!isNaN(sessionBudget) && sessionBudget > 0) {
      config.budget = {
        ...config.budget,
        session: {
          ...DEFAULT_CONFIG.budget?.session,
          amount: sessionBudget,
        },
      };
    }
  }

  return config;
}

export function loadConfig(options: ConfigLoadOptions = {}): PowerlineConfig {
  const { configPath, ignoreEnvVars = false, cliOverrides = {} } = options;

  let config: PowerlineConfig = JSON.parse(JSON.stringify(DEFAULT_CONFIG));

  const configFile = findConfigFile(configPath);
  if (configFile) {
    try {
      const fileConfig = loadConfigFile(configFile);
      config = deepMerge(config, fileConfig);
    } catch (err) {
      console.warn(
        `Warning: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  if (!ignoreEnvVars) {
    const envConfig = loadEnvConfig();
    config = deepMerge(config, envConfig);
  }

  config = deepMerge(config, cliOverrides);

  return config;
}

export function loadConfigFromCLI(
  args: string[] = process.argv
): PowerlineConfig {
  const configPathIndex = args.findIndex((arg) => arg.startsWith("--config="));
  const configPath =
    configPathIndex !== -1
      ? args[configPathIndex]?.split("=")[1]
      : getConfigPathFromEnv();

  const cliOverrides = parseCLIOverrides(args);

  return loadConfig({ configPath, cliOverrides });
}

export function getConfigPath(customPath?: string): string | null {
  return findConfigFile(customPath);
}

export function getDefaultConfigJSON(): string {
  return JSON.stringify(DEFAULT_CONFIG, null, 2);
}
