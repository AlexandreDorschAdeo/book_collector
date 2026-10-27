## ADDED Requirements

### Requirement: Compatibilité Reverse Proxy HTTPS (Nginx / Proxmox LXC)
Le système SHALL prendre en charge les en-têtes de reverse proxy (`X-Forwarded-For`, `X-Forwarded-Proto`) et exposer son port HTTP applicatif (`3000`) afin de fonctionner dans un conteneur Docker au sein d'un LXC Proxmox derrière un serveur Nginx assurant la terminaison HTTPS.

#### Scenario: Requête HTTPS relayée par Nginx
- **WHEN** un client accède à l'application via une URL HTTPS gérée par Nginx qui transmet `X-Forwarded-Proto: https` et `X-Forwarded-For` au conteneur Docker
- **THEN** l'application identifie l'adresse IP réelle du client pour la protection anti-force brute et émet un cookie de session sécurisé (`HttpOnly`, `SameSite=Lax`, `Secure`)
