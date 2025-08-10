# Claude Powerline

A Node.js/TypeScript statusline for Claude Code that mimics vim's powerline style with triangular separators and real-time usage metrics.

## Features

- 🎨 **Powerline-style segments** with triangular separators (`` characters)
- 💰 **Real-time usage tracking** - session cost, daily cost, burn rate
- 🔥 **Color-coded burn rate** indicators (green/yellow/red)
- 🤖 **Model information** display
- ⏱️ **Time remaining** in current usage block
- 📊 **Daily spending** overview

## Installation

### Local Development
```bash
git clone <repo-url>
cd claude-powerline
npm install
npm run build
npm link
```

### From npm (coming soon)
```bash
npm install -g claude-powerline
```

## Usage

### With Claude Code

Add to your Claude settings (`~/.claude/settings.json`):

```json
{
  "statusLine": {
    "type": "command", 
    "command": "claude-powerline",
    "padding": 0
  }
}
```

### Manual Testing

```bash
# Test with mock data
echo '{"session_id": "test", "model": {"display_name": "Opus"}, "workspace": {"current_dir": "/test"}}' | claude-powerline
```

## Development

```bash
# Build TypeScript
npm run build

# Watch mode during development
npm run dev

# Test locally
npm run start < test-data.json
```

## Project Structure

```
claude-powerline/
├── src/
│   ├── index.ts              # Main entry point
│   ├── powerline-renderer.ts # Powerline rendering logic
│   └── types.ts              # TypeScript type definitions
├── dist/                     # Built JavaScript output
├── package.json
├── tsconfig.json
└── README.md
```

## Status Line Segments

1. **🤖 Model** - Current Claude model (blue)
2. **💰 Session Cost** - Cost for current session (green)  
3. **📊 Daily Cost** - Total daily spending (yellow)
4. **⏱ Block Info** - Current block cost and time remaining (cyan)
5. **🔥 Burn Rate** - Spending rate per hour with color coding (green/yellow/red)

## Color Coding

- **Green**: Low burn rate (< $3/hr)
- **Yellow**: Medium burn rate ($3-7/hr)  
- **Red**: High burn rate (> $7/hr)

## License

MIT