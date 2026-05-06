# Infrastructure du serveur

Référence de la config Docker / Nginx Proxy Manager (NPM) sur cette machine,
pour intégrer correctement un nouveau site (ex. `lamutuelleseniors`).

## Vue d'ensemble

- **Hôte** : `mail` — IP publique `146.59.231.199` (Linux 6.8)
- **Reverse proxy** : Nginx Proxy Manager (`jc21/nginx-proxy-manager:latest`), conteneur `npm`
- **Gestion conteneurs** : Portainer (`portainer.qolop.sarl`)
- **Pattern** : chaque site = son propre dossier `/home/jyblonde/<projet>/` avec son `docker-compose.yml`. NPM est attaché aux réseaux Docker de chaque projet pour pouvoir résoudre les noms de conteneurs.

## Nginx Proxy Manager (NPM)

| Élément | Valeur |
|---|---|
| Compose file | `/home/jyblonde/docker-compose.yml` |
| Conteneur | `npm` |
| Admin UI | `http://146.59.231.199:81` |
| Trafic HTTP/HTTPS | ports 80 / 443 |
| Volume données | `/home/jyblonde/data/` → `/data` (db SQLite + confs nginx générées) |
| Volume Let's Encrypt | `/home/jyblonde/letsencrypt/` → `/etc/letsencrypt` |
| Réseau Docker propre | `jyblonde_default` |

**Important** : ne jamais éditer manuellement les `.conf` dans `/data/nginx/proxy_host/` — ils sont régénérés depuis `/data/database.sqlite` et écrasés. Toute modif passe par l'UI :81.

## Sites déployés (mapping domaine → conteneur)

| Domaine(s) | Conteneur cible | Port interne | Dossier projet |
|---|---|---|---|
| `nginx.qolop.sarl` | `npm` (admin) | 81 | `/home/jyblonde` |
| `portainer.qolop.sarl` | `portainer` | 9000 | `/home/jyblonde/portainer` |
| `vos2vis.fr`, `www.vos2vis.fr` | `vos2vis-vos2vis-web` | 3030 | (réseau `vos2vis-network`) |
| `contact-mutuelle.fr`, `www.contact-mutuelle.fr` | `contact-mutuelle` | 3000 | `/home/jyblonde/contact-mutuelle` |
| `piluch.com`, `www.piluch.com` | `piluch_conseil-piluch-conseils-1` | 3000 | `/home/jyblonde/piluch` |
| `assurevie.fr`, `www.assurevie.fr` | `mutuelle-site` | 3000 | `/home/jyblonde/mutuelle-site` |
| `www.solfia.net` | `solfia` | 3000 | `/home/jyblonde/solfia` |
| *(pas de domaine)* | `mutuelle-senior` | 80 | `/home/jyblonde/mutuelle-senior` |

## Convention Compose

Stack type Next.js (cf. `mutuelle-site`) :

```yaml
services:
  <nom-service>:
    build: .
    container_name: <nom-conteneur>
    user: "1001:1001"
    ports:
      - "<port-hote>:3000"
    restart: unless-stopped
    environment:
      NODE_ENV: "production"
      PORT: "3000"
      # ... env vars du projet
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
```

Les apps Next.js exposent `/api/health` pour le healthcheck.

## Déployer un nouveau site (procédure)

1. **Créer le projet** dans `/home/jyblonde/<nom>/` avec `Dockerfile` + `docker-compose.yml`
2. **Premier démarrage** :
   ```bash
   cd /home/jyblonde/<nom> && docker compose up -d --build
   ```
   Cela crée le réseau `<nom>_default` (le nom est dérivé du dossier).
3. **Connecter NPM** au réseau du nouveau projet :
   ```bash
   docker network connect <nom>_default npm
   ```
4. **Tester la résolution depuis NPM** :
   ```bash
   docker exec npm sh -c 'curl -s -o /dev/null -w "%{http_code}\n" http://<container-name>:<port>'
   ```
5. **Ajouter un Proxy Host dans NPM** (UI :81) :
   - Domain Names : `lamutuelleseniors.fr`, `www.lamutuelleseniors.fr`
   - Scheme : `http`
   - Forward Hostname/IP : `<container-name>` (le nom Docker, pas une IP)
   - Forward Port : port interne du conteneur (typiquement `3000`)
   - Cocher "Block Common Exploits"
   - Onglet **SSL** : Request a new SSL Certificate via Let's Encrypt + Force SSL + HTTP/2

## ⚠️ Piège : 502 Bad Gateway après `docker compose up -d`

**Symptôme** : tu modifies un projet, fais `docker compose up -d`, et le site répond 502 via NPM (mais 200 sur localhost:port).

**Cause** : la recréation du conteneur peut entraîner la recréation du réseau Docker du projet. NPM, qui était connecté à l'ancien réseau, se retrouve déconnecté.

**Fix immédiat** :
```bash
docker network connect <nom>_default npm
```

**Fix durable** (recommandé pour les nouveaux projets) :
Faire que NPM et le projet partagent un réseau **externe** dédié. À implémenter en deux temps :

1. Créer un réseau externe partagé (une fois) :
   ```bash
   docker network create proxy-net
   docker network connect proxy-net npm
   ```
2. Dans le `docker-compose.yml` du nouveau projet :
   ```yaml
   services:
     <service>:
       # ...
       networks:
         - default
         - proxy-net

   networks:
     proxy-net:
       external: true
   ```
   Puis dans NPM, pointer vers `<container>:<port>` — ça reste résolvable car les deux conteneurs sont sur `proxy-net`, qui n'est jamais détruit par les `compose down`.

## Notes diverses

- **Identifiants NPM** : ceux qu'utilise le compte de Xavier (changés par rapport au défaut `admin@example.com` / `changeme`).
- **Secrets en dur** : plusieurs `docker-compose.yml` actuels contiennent credentials en clair (Gmail app password, mots de passe API). À migrer vers `.env` (non versionnés) à terme.
- **Domaine du nouveau projet** : à confirmer (probable `lamutuelleseniors.fr` ?). Le domaine doit pointer (DNS A) vers `146.59.231.199` avant de demander le certificat Let's Encrypt.
