#!/usr/bin/env node

import process from 'node:process';
import path from 'node:path';
import fs from 'node:fs';
import { execSync } from 'node:child_process';
import os from 'node:os';
import getStdin from 'get-stdin';
import { PowerlineRenderer } from './powerline.js';
import type { ClaudeHookData } from './types.js';


async function installFonts(): Promise<void> {
  try {
    const platform = os.platform();
    let fontDir: string;
    
    if (platform === 'darwin') {
      fontDir = path.join(os.homedir(), 'Library', 'Fonts');
    } else if (platform === 'linux') {
      fontDir = path.join(os.homedir(), '.local', 'share', 'fonts');
    } else if (platform === 'win32') {
      fontDir = path.join(os.homedir(), 'AppData', 'Local', 'Microsoft', 'Windows', 'Fonts');
    } else {
      console.log('Unsupported platform for font installation');
      return;
    }

    if (!fs.existsSync(fontDir)) {
      fs.mkdirSync(fontDir, { recursive: true });
    }

    console.log('📦 Installing Powerline Fonts...');
    console.log('Downloading from https://github.com/powerline/fonts');
    
    const tempDir = path.join(os.tmpdir(), 'powerline-fonts');
    
    try {
      if (fs.existsSync(tempDir)) {
        execSync(`rm -rf "${tempDir}"`, { stdio: 'ignore' });
      }
      
      console.log('Cloning powerline fonts repository...');
      execSync(`git clone --depth=1 https://github.com/powerline/fonts.git "${tempDir}"`, { stdio: 'inherit' });
      
      console.log('Installing fonts...');
      const installScript = path.join(tempDir, 'install.sh');
      
      if (fs.existsSync(installScript)) {
        execSync(`chmod +x "${installScript}"`, { stdio: 'ignore' });
        execSync(`"${installScript}"`, { stdio: 'inherit', cwd: tempDir });
      } else {
        console.log('Manually copying font files...');
        const fontExtensions = ['.ttf', '.otf', '.pcf.gz'];
        let installed = 0;
        
        function copyFontsRecursively(dir: string) {
          const items = fs.readdirSync(dir);
          for (const item of items) {
            const itemPath = path.join(dir, item);
            const stat = fs.statSync(itemPath);
            
            if (stat.isDirectory()) {
              copyFontsRecursively(itemPath);
            } else if (fontExtensions.some(ext => item.toLowerCase().endsWith(ext))) {
              const destPath = path.join(fontDir, item);
              if (!fs.existsSync(destPath)) {
                fs.copyFileSync(itemPath, destPath);
                installed++;
              }
            }
          }
        }
        
        copyFontsRecursively(tempDir);
        console.log(`Installed ${installed} font files to ${fontDir}`);
        
        if (platform === 'linux' && installed > 0) {
          console.log('Refreshing font cache...');
          try {
            execSync(`fc-cache -f "${fontDir}"`, { stdio: 'inherit' });
          } catch {
            console.log('Warning: Could not refresh font cache');
          }
        }
      }
      
      console.log('✅ Powerline fonts installation complete!');
      console.log('Please restart your terminal and set your terminal font to a powerline font.');
      console.log('Popular choices: Source Code Pro Powerline, DejaVu Sans Mono Powerline, Ubuntu Mono Powerline');
      
    } finally {
      if (fs.existsSync(tempDir)) {
        execSync(`rm -rf "${tempDir}"`, { stdio: 'ignore' });
      }
    }
    
  } catch (error) {
    console.error('❌ Error installing fonts:', error instanceof Error ? error.message : String(error));
    console.log('💡 You can manually install fonts from: https://github.com/powerline/fonts');
  }
}

async function main(): Promise<void> {
  try {
    const style = process.argv.includes('--dark') ? 'dark' : 'colors';
    const showHelp = process.argv.includes('--help') || process.argv.includes('-h');
    const installFontsFlag = process.argv.includes('--install-fonts');
    

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
    "command": "claude-powerline"
  }
}
`);
      process.exit(0);
    }

    const stdin = await getStdin();
    if (stdin.length === 0) {
      console.error('❌ No input provided');
      process.exit(1);
    }

    const hookData: ClaudeHookData = JSON.parse(stdin.trim());

    const renderer = new PowerlineRenderer();
    const statusline = await renderer.generateStatusline(hookData, style);

    console.log(statusline);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ Error generating statusline:', errorMessage);
    process.exit(1);
  }
}

main();