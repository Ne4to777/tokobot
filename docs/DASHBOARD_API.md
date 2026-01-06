# Dashboard API Documentation

The Dashboard API provides analytics, monitoring, and statistics for your Tokobot instance.

## Base URL

**Local**: `http://localhost:3000/api/dashboard`  
**Production**: `https://tokobot-five.vercel.app/api/dashboard`

## Authentication

The dashboard can be optionally protected with a bearer token.

### Setup Authentication

1. Generate a secure token:
```bash
openssl rand -hex 32
```

2. Set `DASHBOARD_TOKEN` environment variable in Vercel

3. Use the token in requests:
```bash
curl -H "Authorization: Bearer your_token" \
  "https://tokobot-five.vercel.app/api/dashboard?action=system-stats"
```

## Endpoints

### Analytics Endpoints

#### System Statistics
```
GET /api/dashboard?action=system-stats
```

Returns overall system statistics.

**Response**:
```json
{
  "success": true,
  "data": {
    "totalUsers": 150,
    "totalCommands": 1234,
    "totalIdeas": 456,
    "totalLeads": 78,
    "totalErrors": 12,
    "uptime": 3600,
    "topCommands": [
      { "command": "idea", "count": 500 },
      { "command": "start", "count": 300 }
    ],
    "activeUsers24h": 45,
    "activeUsers7d": 120
  }
}
```

#### User Statistics
```
GET /api/dashboard?action=user-stats
GET /api/dashboard?action=user-stats&userId=123456
```

Get statistics for all users or a specific user.

**Response**:
```json
{
  "success": true,
  "data": {
    "userId": 123456,
    "username": "testuser",
    "totalCommands": 25,
    "ideasGenerated": 15,
    "leadsCreated": 2,
    "firstSeen": "2026-01-06T10:00:00.000Z",
    "lastSeen": "2026-01-06T23:00:00.000Z"
  }
}
```

#### Recent Events
```
GET /api/dashboard?action=recent-events&limit=50
```

Get recent bot events.

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "type": "command_used",
      "userId": 123456,
      "username": "testuser",
      "timestamp": "2026-01-06T23:00:00.000Z",
      "data": { "command": "idea" }
    }
  ]
}
```

#### Events by Type
```
GET /api/dashboard?action=events-by-type&type=command_used&limit=100
```

Filter events by type.

**Event Types**:
- `command_used`
- `idea_generated`
- `lead_created`
- `error_occurred`
- `user_registered`
- `rate_limit_hit`

#### Events by User
```
GET /api/dashboard?action=events-by-user&userId=123456&limit=100
```

Get all events for a specific user.

#### Export Analytics
```
GET /api/dashboard?action=export
```

Export all analytics data as JSON file.

---

### Monitoring Endpoints

#### Health Check
```
GET /api/dashboard?action=health
```

Get detailed health status.

**Response**:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2026-01-06T23:00:00.000Z",
    "version": "2.0.0",
    "environment": "production",
    "checks": {
      "memory": {
        "status": "healthy",
        "usage": 128,
        "limit": 512
      },
      "uptime": {
        "status": "healthy",
        "seconds": 3600
      },
      "errors": {
        "status": "healthy",
        "count": 12,
        "recentCount": 1
      }
    }
  }
}
```

**Status Values**:
- `healthy`: Everything is working normally
- `degraded`: Some issues detected, but system is functional
- `unhealthy`: Critical issues, system may not be functioning properly

#### Recent Errors
```
GET /api/dashboard?action=errors&limit=50
```

Get recent errors.

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "error_1234567890_abc123",
      "timestamp": "2026-01-06T23:00:00.000Z",
      "severity": "medium",
      "error": {
        "name": "Error",
        "message": "Something went wrong"
      },
      "context": "IdeaHandler",
      "userId": 123456,
      "stack": "..."
    }
  ]
}
```

#### Error Statistics
```
GET /api/dashboard?action=error-stats
```

Get error statistics and trends.

**Response**:
```json
{
  "success": true,
  "data": {
    "totalErrors": 45,
    "errorsLastHour": 2,
    "errorsLast24Hours": 12,
    "topErrors": [
      { "error": "Error:Network timeout", "count": 15 },
      { "error": "Error:API rate limit", "count": 8 }
    ],
    "errorsBySeverity": {
      "low": 20,
      "medium": 18,
      "high": 6,
      "critical": 1
    }
  }
}
```

#### Export Monitoring Data
```
GET /api/dashboard?action=monitoring-export
```

Export all monitoring data including errors, stats, and health checks.

---

## Usage Examples

### Check System Health

```bash
curl "https://tokobot-five.vercel.app/api/dashboard?action=health"
```

### Get Active Users

```bash
curl "https://tokobot-five.vercel.app/api/dashboard?action=system-stats" \
  | jq '.data.activeUsers24h'
```

### Monitor Errors

```bash
# Get recent errors
curl "https://tokobot-five.vercel.app/api/dashboard?action=errors&limit=10"

# Get error statistics
curl "https://tokobot-five.vercel.app/api/dashboard?action=error-stats"
```

### Track User Activity

```bash
# Get specific user stats
curl "https://tokobot-five.vercel.app/api/dashboard?action=user-stats&userId=123456"

# Get user's recent events
curl "https://tokobot-five.vercel.app/api/dashboard?action=events-by-user&userId=123456&limit=20"
```

### With Authentication

```bash
TOKEN="your_dashboard_token"

curl -H "Authorization: Bearer $TOKEN" \
  "https://tokobot-five.vercel.app/api/dashboard?action=system-stats"
```

---

## Integration Examples

### JavaScript/TypeScript

```typescript
const DASHBOARD_URL = "https://tokobot-five.vercel.app/api/dashboard";
const DASHBOARD_TOKEN = process.env.DASHBOARD_TOKEN;

async function getSystemStats() {
  const response = await fetch(
    `${DASHBOARD_URL}?action=system-stats`,
    {
      headers: {
        Authorization: `Bearer ${DASHBOARD_TOKEN}`,
      },
    }
  );
  
  const data = await response.json();
  return data.data;
}

async function checkHealth() {
  const response = await fetch(
    `${DASHBOARD_URL}?action=health`
  );
  
  const data = await response.json();
  console.log(`Status: ${data.data.status}`);
  return data.data;
}
```

### Python

```python
import requests

DASHBOARD_URL = "https://tokobot-five.vercel.app/api/dashboard"
DASHBOARD_TOKEN = "your_token"

def get_system_stats():
    headers = {"Authorization": f"Bearer {DASHBOARD_TOKEN}"}
    response = requests.get(
        f"{DASHBOARD_URL}?action=system-stats",
        headers=headers
    )
    return response.json()["data"]

def check_health():
    response = requests.get(f"{DASHBOARD_URL}?action=health")
    data = response.json()["data"]
    print(f"Status: {data['status']}")
    return data
```

---

## Monitoring Best Practices

1. **Regular Health Checks**
   - Monitor `/api/dashboard?action=health` every 1-5 minutes
   - Alert when status is `degraded` or `unhealthy`

2. **Error Tracking**
   - Check error statistics daily
   - Investigate spikes in error rates
   - Monitor critical errors immediately

3. **Performance Monitoring**
   - Track response times (in logs)
   - Monitor memory usage
   - Watch for rate limiting issues

4. **User Analytics**
   - Track active users trends
   - Monitor command usage patterns
   - Identify popular features

5. **Security**
   - Always use DASHBOARD_TOKEN in production
   - Rotate tokens regularly
   - Monitor unauthorized access attempts

---

## Related Documentation

- [Environment Variables](./ENVIRONMENT_VARIABLES.md)
- [Deployment Guide](./DEPLOYMENT_EXPLAINED.md)
- [Development Guide](./DEVELOPMENT.md)
- [Main README](../README.md)

