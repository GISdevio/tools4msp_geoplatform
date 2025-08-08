# Docker Log Cleanup Service

Automatically truncates Docker container log files larger than 100MB daily.

## Installation

```bash
cp docker-log-cleanup.service /etc/systemd/system/
cp docker-log-cleanup.timer /etc/systemd/system/
systemctl daemon-reload
systemctl enable docker-log-cleanup.timer
systemctl start docker-log-cleanup.timer
```

## Run Now

```bash
systemctl start docker-log-cleanup.service
```

## Reduce Log Volume (Proper Fix)

Double check `.env` files have:
```bash
CELERY__LOG_LEVEL="WARNING"
```

Restart containers after changing.