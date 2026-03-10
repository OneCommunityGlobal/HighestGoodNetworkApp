# Highest Good Network (HGN) App - Agent Documentation

This document provides essential information for AI coding agents working on the Highest Good Network (HGN) React frontend application.

## Project Overview

The Highest Good Network (HGN) App is a comprehensive volunteer management and labor tracking system developed for One Community Global. This is a React-based frontend application that provides:

- **User Management**: Manage volunteers, their profiles, roles, and permissions
- **Time Tracking**: Track volunteer hours and time entries
- **Project Management**: Manage projects, WBS (Work Breakdown Structure), and tasks
- **Dashboard**: Leaderboard, reports, and analytics for organization overview
- **Badge System**: Award and manage volunteer achievements
- **BM Dashboard**: Building materials and construction project management
- **Community Portal**: Event management and attendance tracking
- **Education Portal**: Learning management and student progress tracking
- **Collaboration Portal**: Job applications and team collaboration features

**Backend Repository**: This frontend connects to a separate Node.js/Express backend API.

## Technology Stack

### Core Framework & Libraries
- **React 18.3.1** - UI library
- **Redux** with Redux-Thunk - State management
- **Redux-Persist** - Persist Redux state to localStorage
- **React Router 5.x** - Client-side routing
- **React-Query (TanStack Query)** - Server state management and caching

### UI Components & Styling
- **React-Bootstrap 1.x** - Bootstrap components for React
- **Ant Design (antd) 5.x** - Enterprise-class UI components
- **Material-UI (MUI) 7.x** - Additional UI components
- **CSS Modules** - Component-scoped styling (preferred over plain CSS)
- **SCSS/Sass** - Extended CSS support

### Forms & Editors
- **TinyMCE 7.x** - Rich text editor (GPL v2 licensed)
- **React-Select** - Enhanced select inputs
- **Formik** (implied from structure) - Form management

### Data Visualization
- **Chart.js 4.x** with react-chartjs-2
- **Recharts** - React charting library
- **D3.js** - Data visualization
- **Ant Design Charts** - Additional charting options

### Maps & Location
- **React-Leaflet 4.x** - Maps integration
- **Leaflet** - JavaScript mapping library

### Testing
- **Vitest 3.x** - Primary test runner (replaced Jest)
- **React Testing Library** - Component testing utilities
- **JSDOM** - Browser environment for tests
- **MSW (Mock Service Worker)** - API mocking

### Build & Development
- **Vite 6.x** - Build tool and dev server
- **Yarn 1.22.22** - Package manager
- **Node.js 20 (lts/iron)** - Runtime environment

### Code Quality
- **ESLint 8.x** - Linting with custom flat config
- **Prettier** - Code formatting
- **Stylelint** - CSS linting
- **Husky** - Git hooks
- **lint-staged** - Run linters on staged files

## Project Structure

```
src/
├── actions/              # Redux action creators
│   ├── bmdashboard/      # BM Dashboard actions
│   ├── communityPortal/  # Community Portal actions
│   ├── educationPortal/  # Education Portal actions
│   └── ...
├── components/           # React components
│   ├── common/           # Shared/reusable components
│   ├── BMDashboard/      # Building Materials Dashboard
│   ├── CommunityPortal/  # Community events management
│   ├── EductionPortal/   # Education/Learning portal
│   ├── LBDashboard/      # Listing & Bidding Dashboard
│   ├── Dashboard/        # Main dashboard
│   ├── UserProfile/      # User profile management
│   ├── UserManagement/   # Admin user management
│   ├── Teams/            # Team management
│   ├── Projects/         # Project management
│   ├── Timelog/          # Time tracking
│   ├── Badge/            # Badge management
│   └── ...
├── reducers/             # Redux reducers
│   ├── bmdashboard/      # BM Dashboard state
│   ├── communityPortal/  # Community Portal state
│   ├── educationPortal/  # Education Portal state
│   └── ...
├── utils/                # Utility functions
│   ├── permissions.js    # Role-based permission checks
│   ├── routePermissions.js # Route access control
│   └── ...
├── services/             # API service layers
│   ├── httpService.js    # Axios configuration
│   └── ...
├── context/              # React Context providers
├── routes.jsx            # Route definitions
├── store.js              # Redux store configuration
└── setupTests.js         # Test setup
```

### Key File Naming Conventions
- Components: `PascalCase.jsx` (e.g., `UserProfile.jsx`)
- Component styles: `ComponentName.module.css` or `ComponentName.module.scss`
- Actions: `camelCaseAction.js` (e.g., `userProfileActions.js`)
- Reducers: `camelCaseReducer.js` (e.g., `authReducer.js`)
- Tests: `*.test.js` or `*.test.jsx` (colocated or in `__tests__` folders)

## Build and Development Commands

### Installation
```bash
# Install dependencies (uses Yarn)
yarn install

# Copy TinyMCE to public folder (runs automatically post-install)
npm run postinstall
```

### Development
```bash
# Start development server (runs on port 5173)
npm run start
# OR
npm run start:local

# The dev server proxies API requests to http://localhost:4500
```

### Production Build
```bash
# Create optimized production build (outputs to /build)
npm run build
```

### Docker
```bash
# Build and run with Docker
docker build -t hgn-app .
docker run -p 3000:3000 hgn-app
```

## Testing Instructions

### Run Tests
```bash
# Run all tests once (CI mode)
npm run test

# Run tests in watch mode with verbose output
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests only for changed files (compared to origin/development)
npm run test:changed
```

### Test File Locations
- Unit tests are colocated with source files: `ComponentName.test.jsx`
- Or in `__tests__` folders within component directories
- Action tests: `src/actions/__tests__/*.test.js`
- Utility tests: `src/utils/__tests__/*.test.js`

### Mock Files
- `src/__mocks__/d3.js` - D3 mock for testing
- `src/_tests_/__mocks__/` - Additional test mocks

## Code Style Guidelines

### ESLint Configuration
The project uses ESLint flat config (`eslint.config.js`) with:
- **React hooks rules**: `react-hooks/recommended`
- **Import rules**: `import/recommended`
- **JSX accessibility**: `jsx-a11y/recommended`
- **Prettier integration**: `plugin:prettier/recommended`

### Key Linting Rules
```javascript
// Disabled rules (don't enforce):
'react/prop-types': 'off'           // Not using PropTypes
'react-hooks/exhaustive-deps': 'off' // Dependency array warnings suppressed
'no-underscore-dangle': 'off'        // Allow underscore prefixes
'import/no-unresolved': 'off'        // Handled by build tool

// Enabled rules:
'no-console': 'warn'                 // Console statements warn
'no-alert': 'warn'                   // Alert statements warn
'react/react-in-jsx-scope': 'off'    // Not needed with React 17+
```

### Prettier Configuration (`.prettierrc.json`)
```json
{
  "printWidth": 100,
  "singleQuote": true,
  "trailingComma": "all",
  "bracketSpacing": true,
  "jsxBracketSameLine": false,
  "tabWidth": 2,
  "semi": true,
  "endOfLine": "auto"
}
```

### CSS/Styling Guidelines
- **Use CSS Modules**: Only `.module.css` and `index.css` files are allowed
- **No plain `.css` files**: Husky pre-commit hook will block them
- **Stylelint**: Run `npm run lint:css` to check CSS files

### Running Linters
```bash
# Lint JavaScript/JSX
npm run lint

# Lint with auto-fix
npm run lint:fix

# Lint CSS/SCSS
npm run lint:css
```

## Git Hooks (Husky)

### Pre-commit Hook
Runs automatically on `git commit`:
1. Blocks plain `.css` files (only `.module.css` and `index.css` allowed)
2. Runs `lint-staged` on staged files:
   - ESLint with auto-fix
   - Prettier formatting
3. Commit is blocked if linting fails and cannot be auto-fixed

### Pre-push Hook
Runs automatically on `git push`:
1. Runs all tests (`npm run test`)
2. Runs full lint check (`npm run lint`)
3. Push is blocked if either check fails

### Manual Hook Setup
```bash
# Install husky hooks
npm run prepare
```

## Environment Configuration

### Development Environment (`.env.development`)
```
REACT_APP_APIENDPOINT="http://localhost:4500/api"
SKIP_PREFLIGHT_CHECK=true
DISABLE_ESLINT_PLUGIN=true
REACT_APP_DEF_PWD=123Welcome!
```

### Production Environment
Create `.env` file with production API endpoint:
```
REACT_APP_APIENDPOINT="https://your-production-api.com/api"
```

## API Integration

### HTTP Service (`src/services/httpService.js`)
- Uses Axios for HTTP requests
- Automatically sets JWT token via `setjwt()` function
- Intercepts responses to handle errors with toast notifications

### Backend Proxy (Vite Config)
Development server proxies `/api` requests to `http://localhost:4500`:
```javascript
// vite.config.js
proxy: {
  '/api': {
    target: 'http://localhost:4500',
    changeOrigin: true,
    rewrite: path => path.replace(/^\/api/, ''),
  },
}
```

## Permission System

### Role-Based Access Control
Permissions are checked using the `hasPermission` utility:

```javascript
import hasPermission from '~/utils/permissions';

// In a component
const canEditUser = useSelector(state => hasPermission('editUser'));

// Or in an action
const hasAccess = hasPermission('seeUserManagement')(dispatch, getState);
```

### Protected Routes
Routes use protected components for access control:
- `ProtectedRoute` - General protected routes
- `BMProtectedRoute` - BM Dashboard routes
- `CPProtectedRoute` - Community Portal routes
- `EPProtectedRoute` - Education Portal routes

## Security Considerations

### Protected Admin Accounts
Certain admin accounts are protected from modification:
- `jae@onecommunityglobal.org`
- `one.community@me.com`
- `jsabol@me.com`
- `devadmin@hgn.net`

Use `cantUpdateDevAdminDetails()` utility to check restrictions.

### License Compliance
- **TinyMCE** is licensed under GPLv2
- The project is under **GPL-2.0** license
- Ensure compliance when distributing the application

## CI/CD

### GitHub Actions Workflows
- `.github/workflows/test.yml` - Runs tests on push and PR
- `.github/workflows/deploy.yml` - Deployment workflow
- `.github/workflows/pull_request_test.yml` - PR-specific tests

### PR Requirements
Follow the PR template in `.github/pull_request_template.md`:
- Include description of changes
- Link related backend PRs
- Provide testing steps
- Include screenshots for UI changes
- Verify functionality in dark mode

## Common Issues & Solutions

### Node Version
This project requires Node.js 20 (lts/iron). Use `.nvmrc` with nvm:
```bash
nvm use
```

### TinyMCE Not Loading
If TinyMCE editor doesn't appear, run:
```bash
npm run postinstall
```

### Test Failures with D3
D3 imports are mocked in tests. If you encounter D3-related test failures, check `src/__mocks__/d3.js`.

### Module Resolution
The project uses path aliasing `~` pointing to `src/`:
```javascript
import Component from '~/components/Component';
```

## Contributing

1. Join One Community as a member
2. Create a feature branch: `git checkout -b feature/AmazingFeature`
3. Make your changes following the code style guidelines
4. Commit with descriptive messages
5. Open a Pull Request following the template

## Additional Resources

- **Project README**: `README.md` for general project information
- **Backend API**: Refer to the separate HGN backend repository
- **One Community Website**: https://www.onecommunityglobal.org
