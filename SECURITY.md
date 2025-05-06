# Security Guidelines for Video Text Extractor

## Important Security Notice

**CRITICAL**: We have identified that a Google Cloud service account key was accidentally committed to this repository. This is a serious security issue that needs to be addressed immediately.

## Required Actions

1. **Revoke the exposed service account key immediately**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to "IAM & Admin" > "Service Accounts"
   - Find the service account associated with this key
   - Revoke the key and create a new one

2. **Set up environment variables in Netlify**:
   - Go to your Netlify site settings
   - Navigate to "Build & deploy" > "Environment variables"
   - Add a variable named `GOOGLE_CREDENTIALS` with the content of your new service account key

3. **Remove sensitive files from the repository**:
   - The file `service-account-key.json` should be removed from the repository
   - This file has been added to `.gitignore` to prevent future commits

4. **Clean Git history** (optional but recommended):
   - Use `git filter-branch` or `BFG Repo Cleaner` to remove the key from Git history
   - Instructions for using BFG: https://rtyley.github.io/bfg-repo-cleaner/

## Best Practices for API Keys and Credentials

1. **Never commit API keys or credentials to repositories**:
   - Always use environment variables for sensitive information
   - Use `.env` files locally and add them to `.gitignore`

2. **Use environment variables for all sensitive information**:
   - API keys
   - Service account credentials
   - Database passwords
   - OAuth secrets

3. **Rotate credentials regularly**:
   - Change API keys and service account credentials periodically
   - Especially after team members leave the project

4. **Use the principle of least privilege**:
   - Give service accounts only the permissions they need
   - Restrict API key scopes to the minimum required

5. **Monitor for unauthorized usage**:
   - Set up billing alerts in Google Cloud
   - Regularly check API usage metrics

## Netlify Environment Variables

For this project, the following environment variables should be set in Netlify:

1. `GOOGLE_CREDENTIALS`: The JSON content of your Google Cloud service account key

To set these variables:
1. Go to your Netlify site dashboard
2. Navigate to "Site settings" > "Build & deploy" > "Environment variables"
3. Add each variable with its corresponding value
4. Redeploy your site for the changes to take effect

## Local Development

For local development, create a `.env` file with the required variables:

```
GOOGLE_CREDENTIALS='{"type":"service_account","project_id":"your-project-id",...}'
```

Make sure this file is in your `.gitignore` to prevent accidental commits.

## Reporting Security Issues

If you discover any security issues in this project, please report them immediately by creating an issue in the repository or contacting the repository owner directly.
