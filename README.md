# LANagrafica Frontend

A modern member management application built with React, TypeScript, and Vite. Provides a user-friendly interface for managing club memberships, member data, and card assignments with Auth0 authentication and REST API integration.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Authentication**: Auth0 with JWT tokens
- **State Management**: TanStack Query (React Query)
- **UI Components**: Radix UI with Tailwind CSS
- **Forms**: React Hook Form + Zod validation
- **Deployment**: Docker (Nginx) with Kubernetes support

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server (runs on localhost:3000)
pnpm dev

# Run type checking
pnpm typecheck

# Run linting
pnpm lint

# Build for production
pnpm build
```

## CI/CD Pipeline

This project uses **automated semantic versioning** with GitHub Actions. The CI/CD workflow automatically determines version bumps based on your commit messages.

### How It Works

1. **Commit Analysis**: Scans commits since last tag
2. **Version Bump**: Determines MAJOR, MINOR, or PATCH based on conventional commits
3. **Docker Build**: Creates multi-stage build (Node.js → Nginx Alpine)
4. **Docker Push**: Pushes to `docker.io/arc0t/lanagrafica-fe`
5. **Git Tag**: Creates version tags (release branches only)

### Semantic Versioning Rules

| Commit Type | Version Bump | Example Commit |
|-------------|--------------|----------------|
| `BREAKING CHANGE:` or `!:` | **MAJOR** (X.0.0) | `feat!: redesign authentication API` |
| `feat:` or `feat(...):` | **MINOR** (x.Y.0) | `feat: add member export to CSV` |
| `fix:`, `chore:`, `docs:`, etc. | **PATCH** (x.y.Z) | `fix: resolve login timeout issue` |

### Branch Strategy

- **`main`**: Development branch
  - Docker tags: `X.Y.Z-dev`, `latest`
  - No git tags created

- **`release/**`**: Production releases
  - Docker tags: `X.Y.Z`, `latest`
  - **Git tags created**: `vX.Y.Z`
  - Updates `package.json` version

- **`feature/**`**: Feature development
  - Docker tags: `X.Y.Z-feature-<branch-name>`
  - No git tags created

### Example Workflows

**Creating a patch release (bug fix):**
```bash
git checkout -b release/v1.0.1
git commit -m "fix: resolve authentication timeout"
git push origin release/v1.0.1
# → Creates tag v1.0.1, pushes Docker image 1.0.1
```

**Creating a minor release (new feature):**
```bash
git checkout -b release/v1.1.0
git commit -m "feat: add member export functionality"
git push origin release/v1.1.0
# → Creates tag v1.1.0, pushes Docker image 1.1.0
```

**Creating a major release (breaking change):**
```bash
git checkout -b release/v2.0.0
git commit -m "feat!: migrate to new backend API v2

BREAKING CHANGE: Requires backend API v2.0.0 or higher"
git push origin release/v2.0.0
# → Creates tag v2.0.0, pushes Docker image 2.0.0
```

**Working on a feature:**
```bash
git checkout -b feature/dark-mode
git commit -m "feat: implement dark mode toggle"
git push origin feature/dark-mode
# → Pushes Docker image 1.0.0-feature-dark-mode (no git tag)
```

## Contributing

We welcome contributions! Please follow these guidelines:

### 1. Conventional Commits

Use [Conventional Commits](https://www.conventionalcommits.org/) format for all commit messages:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, no logic change)
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

**Examples:**
```bash
feat: add member search functionality
fix: resolve signature pad not saving
docs: update API integration guide
refactor: simplify auth provider logic
```

### 2. Branch Naming

Follow these patterns:

- `feature/<descriptive-name>` - New features
- `fix/<issue-description>` - Bug fixes
- `release/<version>` - Production releases

**Examples:**
```bash
feature/member-export
feature/dark-mode-support
fix/login-timeout
fix/card-assignment-validation
release/v1.2.0
```

### 3. Development Workflow

1. **Fork or clone** the repository
   ```bash
   git clone https://github.com/Bragarelli/lanagrafica-fe.git
   cd lanagrafica-fe
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Install dependencies**
   ```bash
   pnpm install
   ```

4. **Make your changes**
   - Follow existing code patterns
   - Keep changes focused and atomic
   - Write clear, self-documenting code
   - Avoid over-engineering

5. **Test your changes**
   ```bash
   pnpm typecheck  # TypeScript type checking
   pnpm lint       # ESLint validation
   pnpm build      # Production build test
   ```

6. **Commit with conventional commits**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

7. **Push and create Pull Request**
   ```bash
   git push origin feature/your-feature-name
   # Create PR on GitHub
   ```

### 4. Code Quality Standards

- **TypeScript**: Strict mode enabled, no `any` types without justification
- **ESLint**: Zero warnings policy (configured in `.eslintrc.cjs`)
- **Code Style**: Use Prettier for formatting (`pnpm format`)
- **Components**: Prefer functional components with hooks
- **State**: Use TanStack Query for server state, React Context for UI state

### 5. Pull Request Guidelines

- **Title**: Use conventional commit format (`feat: add feature name`)
- **Description**: Explain what changes were made and why
- **Link Issues**: Reference related issues (`Closes #123`)
- **Small PRs**: Keep changes focused (easier to review)
- **Tests**: Ensure all checks pass before requesting review

### 6. Getting Help

- Check `CLAUDE.md` for detailed project documentation
- Review existing code patterns before implementing new features
- Ask questions in PR comments or discussions
- Follow the simplicity principle - avoid unnecessary complexity

## Docker Deployment

The application is containerized using a multi-stage build:

**Build image:**
```bash
docker build -t lanagrafica-fe:latest .
```

**Run container:**
```bash
docker run -d \
  --name lanagrafica-fe \
  -p 8080:80 \
  -e VITE_AUTH0_DOMAIN=your-domain.auth0.com \
  -e VITE_AUTH0_CLIENT_ID=your-client-id \
  -e VITE_AUTH0_AUDIENCE=your-audience \
  -e VITE_API_BASE_URL=https://api.example.com \
  -e VITE_API_GATEWAY_PORT=8765 \
  -e VITE_API_VERSION=/api/v1 \
  lanagrafica-fe:latest
```

See `DOCKER_NGINX_SETUP.md` for detailed deployment documentation.

## Environment Variables

Required environment variables for development (`.env.local`):

```bash
# Auth0 Configuration
VITE_AUTH0_DOMAIN=your-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
VITE_AUTH0_AUDIENCE=your-audience

# Backend API Configuration
VITE_API_BASE_URL=https://api.example.com
VITE_API_GATEWAY_PORT=8765
VITE_API_VERSION=/api/v1
```

Use `.env.template` as a reference.

## Project Structure

```
lanagrafica-fe/
├── src/
│   ├── api/              # API service calls (REST API)
│   ├── components/
│   │   ├── pages/        # Page components
│   │   ├── providers/    # Context providers
│   │   └── ui/           # Reusable UI components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility libraries (Auth0, API config)
│   ├── types/            # TypeScript type definitions
│   └── main.tsx          # Application entry point
├── .github/workflows/    # GitHub Actions CI/CD
├── Dockerfile            # Multi-stage Docker build
├── nginx.conf            # Nginx configuration
└── test-docker.sh        # Docker testing script
```

## License

[Add your license here]

## Contact

For questions or support, please open an issue on GitHub.
