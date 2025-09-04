# Google Authentication Setup Guide

## Quick Fix Summary
This document provides the complete solution for enabling Google authentication in your Action Figure Generator.

## Issues Fixed
1. ✅ **"Upgrade Now" buttons** - Now properly navigate to sign-in page
2. ✅ **Google Login button** - Will appear once environment variables are configured

## Environment Configuration

### Step 1: Set Up Google OAuth

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create or select a project**
3. **Enable Google+ API**:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. **Create OAuth 2.0 credentials**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (development)
     - `https://yourdomain.com/api/auth/callback/google` (production)

### Step 2: Update Environment Variables

Create a `.env.local` file (or update your existing `.env` file) with:

```env
# Enable Google Authentication
NEXT_PUBLIC_AUTH_GOOGLE_ENABLED="true"
NEXT_PUBLIC_AUTH_GOOGLE_ONE_TAP_ENABLED="true"

# Google OAuth Credentials (from Google Cloud Console)
AUTH_GOOGLE_ID="your-google-client-id"
AUTH_GOOGLE_SECRET="your-google-client-secret"
NEXT_PUBLIC_AUTH_GOOGLE_ID="your-google-client-id"

# Next-Auth Configuration
AUTH_SECRET="your-generated-secret-key"
AUTH_URL="http://localhost:3000/api/auth"
AUTH_TRUST_HOST="true"

# Web URL (update for production)
NEXT_PUBLIC_WEB_URL="http://localhost:3000"
```

### Step 3: Generate AUTH_SECRET

Run this command to generate a secure authentication secret:

```bash
openssl rand -base64 32
```

Copy the output and use it as your `AUTH_SECRET` value.

## Testing the Fix

### 1. Start your development server:
```bash
pnpm dev
```

### 2. Test "Upgrade Now" buttons:
- Visit the homepage: `http://localhost:3000`
- Scroll to the pricing section
- Click any "UPGRADE NOW", "GO PRO", or "CONTACT SALES" button
- Should redirect to: `http://localhost:3000/[locale]/auth/signin`

### 3. Test Google login:
- Visit the sign-in page: `http://localhost:3000/en/auth/signin`
- You should now see the "Sign in with Google" button
- Click it to test the Google OAuth flow

## Button Behavior Changes

| Button | Old Behavior | New Behavior |
|--------|-------------|-------------|
| `START FREE` | No action | Scrolls to generator section |
| `UPGRADE NOW` | No action | Redirects to sign-in page |
| `GO PRO` | No action | Redirects to sign-in page |
| `CONTACT SALES` | No action | Redirects to sign-in page |

## Production Deployment

For production deployment, update these values in your hosting platform:

```env
NEXT_PUBLIC_WEB_URL="https://yourdomain.com"
AUTH_URL="https://yourdomain.com/api/auth"
```

And add the production callback URL to your Google OAuth configuration:
```
https://yourdomain.com/api/auth/callback/google
```

## Troubleshooting

### Google Login Button Not Appearing
- Verify `NEXT_PUBLIC_AUTH_GOOGLE_ENABLED="true"` in your `.env` file
- Restart your development server after changing environment variables
- Check the browser console for any error messages

### OAuth Errors
- Ensure callback URLs match exactly in Google Cloud Console
- Verify your Google Client ID and Secret are correct
- Check that Google+ API is enabled in your Google Cloud project

### Button Click Issues
- Clear browser cache and hard refresh (Cmd+Shift+R / Ctrl+Shift+F5)
- Check browser developer tools for JavaScript errors
- Ensure you're using the latest code changes

## Security Notes

- Never commit `.env.local` or `.env` files containing secrets to version control
- Use different Google OAuth applications for development and production
- Regularly rotate your `AUTH_SECRET` in production
- Consider implementing additional security measures like CSRF protection

## Support

If you continue experiencing issues:
1. Check the browser console for error messages
2. Verify all environment variables are correctly set
3. Ensure your Google Cloud project has the necessary APIs enabled
4. Test with a fresh browser session (incognito/private mode)