# Environment Setup

## Backend Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database
DB_PATH=./database.sqlite

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# OAuth Configuration (for Gmail)
EMAIL_OAUTH_ENABLED=true
OAUTH_CLIENT_ID=your-google-oauth-client-id
OAUTH_CLIENT_SECRET=your-google-oauth-client-secret
OAUTH_REFRESH_TOKEN=your-google-oauth-refresh-token

# Payment Configuration (if using Stripe)
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key

# Other API Keys
TNG_API_KEY=your-tng-api-key
TNG_API_SECRET=your-tng-api-secret
```

## Getting Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Gmail API
4. Go to "Credentials" and create OAuth 2.0 Client IDs
5. Add your domain to authorized origins
6. Download the credentials and use the client ID and secret

## Security Notes

- Never commit `.env` files to version control
- Use strong, unique passwords for all services
- Regularly rotate API keys and secrets
- Use environment-specific configurations for production
