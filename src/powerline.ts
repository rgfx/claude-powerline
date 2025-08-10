import type { ClaudeHookData, PowerlineColors } from './types.js';

type PowerlineStyle = 'colors' | 'dark';

interface PowerlineSymbols {
  left: string;
  left_alt: string; 
  right: string;
  right_alt: string;
  branch: string;
  readonly: string;
  linenr: string;
  maxlinenr: string;
  dirty: string;
  crypt: string;
  paste: string;
  spell: string;
  notexists: string;
  whitespace: string;
  modified: string;
  model: string;
  folder: string;
  time: string;
  session: string;
  git_clean: string;
  git_dirty: string;
  git_conflicts: string;
  git_ahead: string;
  git_behind: string;
}

export class PowerlineRenderer {
  private readonly symbols: PowerlineSymbols;
  private readonly colors: Record<PowerlineStyle, PowerlineColors>;

  constructor() {
    this.symbols = this.initializeSymbols();
    this.colors = {
      colors: {
        reset: '\x1b[0m',
        modeBg: '\x1b[48;2;255;107;71m',
        modeFg: '\x1b[97m',
        sessionBg: '\x1b[48;2;79;179;217m',
        sessionFg: '\x1b[97m',
        dailyBg: '\x1b[48;2;135;206;235m',
        dailyFg: '\x1b[30m',
        blockBg: '\x1b[48;2;218;112;214m',
        blockFg: '\x1b[97m',
        burnLowBg: '\x1b[48;2;144;238;144m',
        burnMedBg: '\x1b[48;2;255;165;0m',
        burnHighBg: '\x1b[48;2;255;69;0m',
        burnFg: '\x1b[97m',
        burnLowSep: '\x1b[38;2;144;238;144m',
        burnMedSep: '\x1b[38;2;255;165;0m',
        burnHighSep: '\x1b[38;2;255;69;0m',
        modeSep: '\x1b[38;2;255;107;71m',
        sessionSep: '\x1b[38;2;79;179;217m',
        dailySep: '\x1b[38;2;135;206;235m',
        blockSep: '\x1b[38;2;218;112;214m'
      },
      dark: {
        reset: '\x1b[0m',
        modeBg: '\x1b[48;2;139;69;19m',
        modeFg: '\x1b[97m',
        sessionBg: '\x1b[48;2;64;64;64m',
        sessionFg: '\x1b[97m',
        dailyBg: '\x1b[48;2;45;45;45m',
        dailyFg: '\x1b[97m',
        blockBg: '\x1b[48;2;32;32;32m',
        blockFg: '\x1b[96m',
        burnLowBg: '\x1b[48;2;28;28;28m',
        burnMedBg: '\x1b[48;2;40;40;40m',
        burnHighBg: '\x1b[48;2;139;69;19m',
        burnFg: '\x1b[97m',
        burnLowSep: '\x1b[38;2;28;28;28m',
        burnMedSep: '\x1b[38;2;40;40;40m',
        burnHighSep: '\x1b[38;2;139;69;19m',
        modeSep: '\x1b[38;2;139;69;19m',
        sessionSep: '\x1b[38;2;64;64;64m',
        dailySep: '\x1b[38;2;45;45;45m',
        blockSep: '\x1b[38;2;32;32;32m'
      }
    };
  }


  private initializeSymbols(): PowerlineSymbols {
    return {
      left: '\uE0B2',
      left_alt: '\uE0B3',
      right: '\uE0B0',
      right_alt: '\uE0B1',
      branch: '\uE0A0',
      readonly: '\uE0A2',
      linenr: '\uE0A1',
      maxlinenr: '\uE0A1',
      dirty: '⚡',
      crypt: '\uE0A2',
      paste: 'ρ',
      spell: 'Ꞩ',
      notexists: 'Ɇ',
      whitespace: '☲',
      modified: '+',
      model: '⚡',
      folder: '◉',
      time: '◴',
      session: '◈',
      git_clean: '✓',
      git_dirty: '⚡',
      git_conflicts: '⚠',
      git_ahead: '↑',
      git_behind: '↓'
    };
  }

  private extractBgColor(ansiCode: string): string {
    const match = ansiCode.match(/48;2;(\d+);(\d+);(\d+)/);
    if (match) {
      return `\x1b[38;2;${match[1]};${match[2]};${match[3]}m`;
    }
    return ansiCode.replace('48', '38');
  }

  private renderSegment(bgColor: string, fgColor: string, text: string, nextBgColor?: string): string {
    let output = `${bgColor}${fgColor} ${text} `;
    
    if (nextBgColor) {
      const arrowFgColor = this.extractBgColor(bgColor);
      output += `${nextBgColor}${arrowFgColor}${this.symbols.right}`;
    } else {
      const arrowFgColor = this.extractBgColor(bgColor);
      output += `${this.colors.colors.reset}${arrowFgColor}${this.symbols.right}${this.colors.colors.reset}`;
    }

    return output;
  }


  private getGitInfo(workingDir: string): { branch: string; hash: string; status: string; ahead: number; behind: number } | null {
    try {
      const { execSync } = require('child_process');
      
      const branch = execSync('git branch --show-current 2>/dev/null', { 
        cwd: workingDir,
        encoding: 'utf8',
        timeout: 1000
      }).trim();
      
      const hash = execSync('git rev-parse --short=7 HEAD 2>/dev/null', {
        cwd: workingDir,
        encoding: 'utf8',
        timeout: 1000
      }).trim();
      
      const gitStatus = execSync('git status --porcelain 2>/dev/null', {
        cwd: workingDir,
        encoding: 'utf8',
        timeout: 1000
      }).trim();
      
      let status = 'clean';
      if (gitStatus) {
        if (gitStatus.includes('UU') || gitStatus.includes('AA') || gitStatus.includes('DD')) {
          status = 'conflicts';
        } else {
          status = 'dirty';
        }
      }
      
      let ahead = 0, behind = 0;
      try {
        const aheadResult = execSync('git rev-list --count @{u}..HEAD 2>/dev/null', {
          cwd: workingDir,
          encoding: 'utf8',
          timeout: 1000
        }).trim();
        ahead = parseInt(aheadResult) || 0;
        
        const behindResult = execSync('git rev-list --count HEAD..@{u} 2>/dev/null', {
          cwd: workingDir,
          encoding: 'utf8',
          timeout: 1000
        }).trim();
        behind = parseInt(behindResult) || 0;
      } catch {
        // No upstream or other error, keep ahead/behind as 0
      }
      
      return { branch: branch || 'detached', hash, status, ahead, behind };
    } catch {
      return null;
    }
  }

  private getCurrentTime(): string {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit', 
      minute: '2-digit'
    });
  }

  async generateStatusline(hookData: ClaudeHookData, style: PowerlineStyle = 'colors'): Promise<string> {
    const modelName = hookData.model?.display_name || 'Claude';
    const currentDir = hookData.workspace?.current_dir || hookData.cwd || '/';
    const projectDir = hookData.workspace?.project_dir;
    
    let dirName: string;
    if (projectDir && projectDir !== currentDir) {
      const projectName = projectDir.split('/').pop() || 'project';
      const currentDirName = currentDir.split('/').pop() || 'root';
      dirName = currentDir.includes(projectDir) ? `${projectName}/${currentDirName}` : currentDirName;
    } else {
      dirName = currentDir.split('/').pop() || 'root';
    }
    const gitInfo = this.getGitInfo(currentDir);
    const currentTime = this.getCurrentTime();
    
    const colors = this.colors[style];

    let statusline = '';

    statusline += this.renderSegment(
      colors.modeBg,
      colors.modeFg,
      `${this.symbols.model} ${modelName}`,
      colors.sessionBg
    );

    if (gitInfo) {
      let gitStatusIcon = this.symbols.git_clean;
      if (gitInfo.status === 'conflicts') {
        gitStatusIcon = this.symbols.git_conflicts;
      } else if (gitInfo.status === 'dirty') {
        gitStatusIcon = this.symbols.git_dirty;
      }
      
      let branchText = `${this.symbols.branch} ${gitInfo.branch} ${gitStatusIcon}`;
      
      if (gitInfo.ahead > 0 && gitInfo.behind > 0) {
        branchText += ` ${this.symbols.git_ahead}${gitInfo.ahead}${this.symbols.git_behind}${gitInfo.behind}`;
      } else if (gitInfo.ahead > 0) {
        branchText += ` ${this.symbols.git_ahead}${gitInfo.ahead}`;
      } else if (gitInfo.behind > 0) {
        branchText += ` ${this.symbols.git_behind}${gitInfo.behind}`;
      }
      
      statusline += this.renderSegment(
        colors.sessionBg,
        colors.sessionFg,
        branchText,
        colors.dailyBg
      );
      
      statusline += this.renderSegment(
        colors.dailyBg,
        colors.dailyFg,
        `${this.symbols.session} ${gitInfo.hash}`,
        colors.blockBg
      );
    }

    statusline += this.renderSegment(
      gitInfo ? colors.blockBg : colors.sessionBg,
      gitInfo ? colors.blockFg : colors.sessionFg,
      `${this.symbols.folder} ${dirName}`,
      gitInfo ? colors.burnLowBg : colors.blockBg
    );

    statusline += this.renderSegment(
      gitInfo ? colors.burnLowBg : colors.blockBg,
      gitInfo ? colors.burnFg : colors.blockFg,
      `${this.symbols.time} ${currentTime}`
    );

    return statusline;
  }
}