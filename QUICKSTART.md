# Digital Evidence Vault - Quick Start Guide

## Getting Started

### Prerequisites
- Node.js (v16 or later)
- npm or yarn

### Installation

1. **Clone or navigate to the project:**
```bash
cd /Users/ajitesh/Desktop/hack/digital-evidence-vault-devfest5.0
```

2. **Install frontend dependencies:**
```bash
cd frontend
npm install
```

3. **Install backend dependencies:**
```bash
cd ../backend
npm install
```

### Running the Application

#### Start Backend Server
```bash
cd backend
node server.js
```

The server will start on `http://localhost:3001` with the following output:
```
╔═══════════════════════════════════════════════════╗
║  Digital Evidence Vault - Backend API Server   ║
╚═══════════════════════════════════════════════════╝

✓ Server running on http://localhost:3001
✓ Blockchain connected
✓ 5 evidence items in mock database
✓ 3 active alerts
```

#### Start Frontend Development Server
```bash
cd frontend
npm run dev
```

Access the application at `http://localhost:5173`

## Features Overview

### Dark Mode
- Toggle between light and dark themes using the theme selector in Settings
- Theme preference is saved to localStorage
- All pages and components support both themes

### Pages

1. **Dashboard** - Overview with statistics and charts
2. **Evidence Vault** - Browse and search evidence with filtering
3. **Upload Evidence** - Add new evidence to the blockchain
4. **Chain of Custody** - View evidence handling history
5. **Verification** - Verify evidence integrity
6. **Alerts** - System warnings and notifications
7. **Audit Log** - Complete system activity log
8. **Settings** - User preferences and theme selection

### Charts
- **Evidence Status** - Pie chart showing verification status
- **Evidence Trend** - Area chart showing upload trends
- **Collector Activity** - Bar chart of top collectors

All charts feature:
- Interactive tooltips
- Dark mode support
- Smooth animations
- Responsive design

## API Endpoints

### Analytics
- `GET /api/analytics/status` - Evidence status distribution
- `GET /api/analytics/trends` - Upload trends
- `GET /api/analytics/collectors` - Collector activity

### Evidence
- `GET /api/evidence` - List evidence (supports search, filter, pagination)
- `GET /api/evidence/:id` - Get specific evidence
- `POST /api/evidence/upload` - Upload new evidence

### System
- `GET /api/health` - Health check
- `GET /api/stats` - System statistics
- `GET /api/custody/:evidenceId` - Chain of custody
- `POST /api/verify` - Verify evidence
- `GET /api/alerts` - Get alerts
- `GET /api/audit-log` - Audit trail

## Example API Calls

### Get Evidence List
```bash
curl http://localhost:3001/api/evidence
```

### Search Evidence
```bash
curl "http://localhost:3001/api/evidence?search=Ryan&status=verified"
```

### Upload Evidence
```bash
curl -X POST http://localhost:3001/api/evidence/upload \
  -H "Content-Type: application/json" \
  -d '{"type":"Video","caseId":"CR-2024-1900","source":"CCTV-5"}'
```

### Verify Evidence  
```bash
curl -X POST http://localhost:3001/api/verify \
  -H "Content-Type: application/json" \
  -d '{"evidenceId":"EV-2024-001","fileHash":"0x8f...2a"}'
```

## Development

### Project Structure
```
digital-evidence-vault-devfest5.0/
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── charts/          # Chart components
│       │   ├── layout/          # Layout components
│       │   └── ui/              # Reusable UI components
│       ├── pages/               # Page components
│       ├── context/             # React context (theme)
│       └── utils/               # Utilities
└── backend/
    └── server.js                # Express API server
```

### Key Technologies
- **Frontend**: React, TypeScript, Tailwind CSS, Recharts
- **Backend**: Express.js, Node.js
- **State**: React Context API
- **Styling**: Tailwind CSS with dark mode

## Customization

### Adding New Charts
1. Create component in `frontend/src/components/charts/`
2. Import `useTheme` hook for dark mode
3. Use Recharts components with custom tooltips
4. Export with props interface for data

### Modifying Theme
- Theme context: `frontend/src/context/ThemeContext.tsx`
- Dark mode classes use Tailwind's `dark:` variant
- Toggle persists in localStorage as `sentinel-theme`

### Adding API Endpoints
1. Add route in `backend/server.js`
2. Implement handler with error handling
3. Return JSON responses
4. Update API documentation

## Tips

- Use browser DevTools to inspect component hierarchy
- Check console for API requests and responses
- Use React DevTools to debug state
- Test dark mode by toggling in Settings

## Troubleshooting

**Backend won't start:**
- Check if port 3001 is available
- Verify Node.js version (16+)
- Run `npm install` in backend directory

**Frontend won't start:**
- Check if port 5173 is available  
- Verify dependencies with `npm install`
- Clear cache: `rm -rf node_modules package-lock.json && npm install`

**Dark mode not working:**
- Check localStorage for `sentinel-theme` key
- Verify ThemeProvider wraps App component
- Inspect elements for `dark` class on `<html>`

## Resources

- [React Documentation](https://react.dev/)
- [Tailwind CSS Dark Mode](https://tailwindcss.com/docs/dark-mode)
- [Recharts Documentation](https://recharts.org/)
- [Express.js Guide](https://expressjs.com/)
