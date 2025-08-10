#!/usr/bin/env node

import process from "node:process";
import path from "node:path";
import fs from "node:fs";
import { execSync } from "node:child_process";
import os from "node:os";
import getStdin from "get-stdin";
import { PowerlineRenderer } from "./powerline.ts";
import type { ClaudeHookData } from "./types.ts";

async function installFonts(): Promise<void> {
  try {
    const platform = os.platform();
    let fontDir: string;

    if (platform === "darwin") {
      fontDir = path.join(os.homedir(), "Library", "Fonts");
    } else if (platform === "linux") {
      fontDir = path.join(os.homedir(), ".local", "share", "fonts");
    } else if (platform === "win32") {
      fontDir = path.join(
        os.homedir(),
        "AppData",
        "Local",
        "Microsoft",
        "Windows",
        "Fonts"
      );
    } else {
      console.log("Unsupported platform for font installation");
      return;
    }

    if (!fs.existsSync(fontDir)) {
      fs.mkdirSync(fontDir, { recursive: true });
    }

    console.log("📦 Installing Powerline Fonts...");
    console.log("Downloading from https://github.com/powerline/fonts");

    const tempDir = path.join(os.tmpdir(), "powerline-fonts");

    try {
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }

      console.log("Cloning powerline fonts repository...");
      execSync(
        "git clone --depth=1 https://github.com/powerline/fonts.git powerline-fonts",
        {
          stdio: "inherit",
          cwd: os.tmpdir(),
        }
      );

      console.log("Installing fonts...");
      const installScript = path.join(tempDir, "install.sh");

      if (fs.existsSync(installScript)) {
        fs.chmodSync(installScript, 0o755);
        execSync("./install.sh", { stdio: "inherit", cwd: tempDir });
      } else {
        throw new Error(
          "Install script not found in powerline fonts repository"
        );
      }

      console.log("✅ Powerline fonts installation complete!");
      console.log(
        "Please restart your terminal and set your terminal font to a powerline font."
      );
      console.log(
        "Popular choices: Source Code Pro Powerline, DejaVu Sans Mono Powerline, Ubuntu Mono Powerline"
      );
    } finally {
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    }
  } catch (error) {
    console.error(
      "Error installing fonts:",
      error instanceof Error ? error.message : String(error)
    );
    console.log(
      "💡 You can manually install fonts from: https://github.com/powerline/fonts"
    );
  }
}

async function main(): Promise<void> {
  try {
    const style = process.argv.includes("--dark") ? "dark" : "colors";
    const showHelp =
      process.argv.includes("--help") || process.argv.includes("-h");
    const installFontsFlag = process.argv.includes("--install-fonts");

    if (installFontsFlag) {
      await installFonts();
      process.exit(0);
    }

    if (showHelp) {
      console.log(`
claude-powerline - Beautiful powerline statusline for Claude Code

Usage: claude-powerline [options]

Options:
  --dark              Use dark color scheme
  --install-fonts     Install powerline fonts to system
  -h, --help          Show this help

Usage in Claude Code settings.json:
{
  "statusLine": {
    "type": "command",
    "command": "claude-powerline",
    "padding": 0
  }
}
`);
      process.exit(0);
    }

    const stdin = await getStdin();
    if (stdin.length === 0) {
      console.error("Error: No input provided");
      console.log(`
claude-powerline - Beautiful powerline statusline for Claude Code

Usage: claude-powerline [options]

Options:
  --dark              Use dark color scheme
  --install-fonts     Install powerline fonts to system
  -h, --help          Show this help

Usage in Claude Code settings.json:
{
  "statusLine": {
    "type": "command",
    "command": "claude-powerline",
    "padding": 0
  }
}
`);
      process.exit(1);
    }

    let hookData: ClaudeHookData;
    try {
      hookData = JSON.parse(stdin.trim());
    } catch (error) {
      console.error(
        "Error: Invalid JSON input:",
        error instanceof Error ? error.message : String(error)
      );
      process.exit(1);
    }

    const renderer = new PowerlineRenderer();
    const statusline = await renderer.generateStatusline(hookData, style);

    console.log(statusline);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error generating statusline:", errorMessage);
    process.exit(1);
  }
}

main();
