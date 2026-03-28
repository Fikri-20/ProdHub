# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability within ProdHub, please report it responsibly.

**Please do NOT report security issues via GitHub Issues.**

Instead, please send a description of the vulnerability to the maintainers via a **private security advisory**:

1. Go to the [Security Advisories](https://github.com/anomaly/prodhub/security/advisories) page
2. Click "Report a vulnerability"
3. Fill out the form with as much detail as possible

We aim to respond within **48 hours** and will work with you to understand and address the issue promptly.

## Security Model

ProdHub is a local-first application. Key security considerations:

- **Data Storage**: All data is stored locally in `prisma/prodhub.db` on your machine. No data is sent to external servers (except heartbeats from agents to the local API).
- **API Authentication**: Agents authenticate using API keys stored in `~/.prodhub/agent.json`. These keys are SHA-256 hashed before storage.
- **No Telemetry**: ProdHub does not collect any usage analytics or telemetry.
- **Network**: The API server binds to `localhost` by default. If you expose it on a LAN, set `REQUIRE_AUTH=true`.

## Best Practices

- Keep your `~/.prodhub/agent.json` file private
- Use `REQUIRE_AUTH=true` if exposing the API beyond localhost
- Keep your operating system and Node.js runtime updated
