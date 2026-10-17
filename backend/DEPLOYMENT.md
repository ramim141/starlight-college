# Deployment guide

## Current SQLite mode

The current `.env` is suitable for local development:

```env
DEBUG=True
DB_ENGINE=django.db.backends.sqlite3
REQUIRE_POSTGRES=False
```

Start the application:

```powershell
.\venv\Scripts\python.exe manage.py migrate
.\venv\Scripts\python.exe manage.py runserver 127.0.0.1:8000
```

Redis is optional in this mode. Without `REDIS_URL`, Django uses its local
in-memory cache. This is suitable for one development process only.

## Redis setup

Redis is a shared cache. It is not the database and it does not replace
PostgreSQL.

For local Windows development, the simplest options are:

1. Install Redis through Docker Desktop:

   ```powershell
   docker run --name starlight-redis -p 6379:6379 -d redis:7-alpine
   ```

2. Add this to `.env`:

   ```env
   REDIS_URL=redis://127.0.0.1:6379/1
   ```

3. Restart Django.

Verify Redis:

```powershell
docker exec starlight-redis redis-cli ping
```

Expected output:

```text
PONG
```

To stop or restart the local Redis container:

```powershell
docker stop starlight-redis
docker start starlight-redis
```

In production, use a managed Redis service or a private Redis instance.
Never expose Redis directly to the public internet.

## Final PostgreSQL deployment

Before going live:

1. Provision PostgreSQL and create an application database/user.
2. Set these environment variables:

   ```env
   DEBUG=False
   REQUIRE_POSTGRES=True
   DB_ENGINE=django.db.backends.postgresql
   DB_NAME=starlight
   DB_USER=starlight_app
   DB_PASSWORD=<strong-password>
   DB_HOST=<private-postgres-host>
   DB_PORT=5432
   REDIS_URL=redis://<private-redis-host>:6379/1
   ALLOWED_HOSTS=api.example.com
   CORS_ALLOWED_ORIGINS=https://app.example.com
   CSRF_TRUSTED_ORIGINS=https://api.example.com
   SECURE_SSL_REDIRECT=True
   SESSION_COOKIE_SECURE=True
   CSRF_COOKIE_SECURE=True
   ```

3. Back up the SQLite database before migration.
4. Export SQLite data to JSON:

   ```powershell
   .\venv\Scripts\python.exe manage.py dumpdata `
     --natural-foreign --natural-primary `
     --exclude contenttypes --exclude auth.permission `
     --indent 2 > backup.json
   ```

5. Change the environment to PostgreSQL and create the schema:

   ```powershell
   .\venv\Scripts\python.exe manage.py migrate
   ```

6. Load the exported data and verify counts:

   ```powershell
   .\venv\Scripts\python.exe manage.py loaddata backup.json
   .\venv\Scripts\python.exe manage.py check --deploy
   ```

7. Collect static files:

   ```powershell
   .\venv\Scripts\python.exe manage.py collectstatic --noinput
   ```

8. Start Gunicorn behind an HTTPS reverse proxy:

   ```powershell
   gunicorn config.wsgi:application -c gunicorn.conf.py
   ```

9. Verify:

   ```powershell
   curl https://api.example.com/health/
   ```

## Operational requirements

- Keep `.env`, database passwords, JWT secrets, and backups outside source control.
- Use HTTPS at the reverse proxy/load balancer.
- Restrict PostgreSQL and Redis to private network access.
- Schedule encrypted database backups and test restore regularly.
- Run `manage.py migrate`, `collectstatic`, `check --deploy`, and the test suite
  during every release.
- Do not run Django's development server in production.
