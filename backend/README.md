# NeuroVidya Backend

FastAPI-based backend for the NeuroVidya adaptive learning platform.

## Features

- **FastAPI**: Modern, fast web framework for building APIs
- **Prisma ORM**: Type-safe database access with PostgreSQL
- **JWT Authentication**: Secure token-based authentication
- **CORS Support**: Cross-origin resource sharing for frontend integration
- **AI Integration**: OpenAI and Anthropic API support
- **Async/Await**: Full async support for high-performance operations

## Prerequisites

- Python 3.11 or higher
- PostgreSQL 14 or higher
- Virtual environment (recommended)

## Installation

1. **Clone and navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment:**
   ```bash
   python -m venv venv
   ```

3. **Activate the virtual environment:**

   **Windows:**
   ```bash
   venv\Scripts\activate
   ```

   **Linux/Mac:**
   ```bash
   source venv/bin/activate
   ```

4. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `SECRET_KEY`: Random secret key for JWT
   - `OPENAI_API_KEY`: Your OpenAI API key (optional)
   - `ANTHROPIC_API_KEY`: Your Anthropic API key (optional)

## Database Setup

The Prisma schema will be initialized in Task 3. After schema initialization:

```bash
# Generate Prisma client
prisma generate

# Run migrations
prisma migrate dev

# Optional: Seed database
prisma db seed
```

## Running the Server

**Development mode (with auto-reload):**
```bash
uvicorn app.main:app --reload --port 8000
```

**Production mode:**
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

The API will be available at:
- API: http://localhost:8000
- Interactive Docs (Swagger UI): http://localhost:8000/api/docs
- Alternative Docs (ReDoc): http://localhost:8000/api/redoc

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Health Check
- `GET /` - Root endpoint
- `GET /api/health` - Health check endpoint

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application
│   ├── api/
│   │   ├── __init__.py
│   │   └── auth.py          # Authentication routes
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py        # Application settings
│   │   ├── deps.py          # Dependencies
│   │   └── security.py      # Security utilities
│   ├── models/
│   │   ├── __init__.py
│   │   └── models.py        # Prisma models
│   └── schemas/
│       ├── __init__.py
│       └── auth.py          # Pydantic schemas
├── prisma/
│   └── schema.prisma        # Database schema (Task 3)
├── tests/                   # Test files
├── .env.example             # Environment template
├── .gitignore
├── pyproject.toml
└── requirements.txt
```

## Development

### Code Style
This project uses:
- **Black** for code formatting
- **isort** for import sorting
- **mypy** for type checking

Run linting:
```bash
black app/
isort app/
mypy app/
```

### Testing
```bash
# Run tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html
```

## Security Notes

1. **SECRET_KEY**: Generate a strong random key for production
2. **CORS**: Update `FRONTEND_URL` in `.env` for production
3. **HTTPS**: Use HTTPS in production
4. **Database**: Use strong passwords and restrict access

## License

MIT License - See LICENSE file for details
