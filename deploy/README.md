# Deploying PriceMyDomain on a Linux server (e.g. a CloudStack VM)

Everything runs in Docker: nginx (website + `/api` proxy), FastAPI and PostgreSQL. Only port 80 is opened.

## 1. Install Docker on the VM (Ubuntu)

```bash
sudo apt update
sudo apt install -y ca-certificates curl git
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
```

Log out and back in so `docker` works without `sudo`, then check:

```bash
docker --version
docker compose version
```

## 2. Get the code

```bash
git clone https://github.com/ZackHopper07/Domain_Expansion.git
cd Domain_Expansion
git switch feat/backend-fastapi     # until it's merged into main
```

## 3. Set the database password

```bash
echo "POSTGRES_PASSWORD=$(openssl rand -hex 24)" > .env
chmod 600 .env
```

`.env` is git-ignored. Don't commit it.

## 4. Start it

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

The first build takes a few minutes. Check it:

```bash
docker compose -f docker-compose.prod.yml ps
curl http://localhost/api/health
```

The site is now at `http://<VM-IP>/`, and the API docs are at `http://<VM-IP>/docs`.

## Updating after new commits

```bash
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

## Useful commands

| What | Command |
|---|---|
| See logs | `docker compose -f docker-compose.prod.yml logs -f --tail 100` |
| Stop | `docker compose -f docker-compose.prod.yml down` |
| Stop **and delete the database** | `docker compose -f docker-compose.prod.yml down -v` |

The containers restart on their own after a reboot.

## Settings (in `.env`)

| Setting | Default | Meaning |
|---|---|---|
| `POSTGRES_PASSWORD` | (required) | Database password |
| `WEB_PORT` | `80` | Port the site listens on |
| `AVAILABILITY` | `rdap` | `rdap` = real registry lookups, `demo` = sample data |
| `PROVIDERS` | `demo` | Where prices come from (sample until real registrars are added) |

The VM needs outbound internet access for the RDAP availability checks.
