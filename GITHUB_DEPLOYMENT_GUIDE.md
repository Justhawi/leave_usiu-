# GitHub Pages Deployment Guide

This guide will help you deploy the USIU Leave Management System to GitHub Pages for free hosting.

## Prerequisites

- A GitHub account
- Git installed on your computer (optional, can use GitHub web interface)
- Firebase project set up (see FIREBASE_SETUP_GUIDE.md)

## Method 1: Using GitHub Web Interface (Easiest)

### Step 1: Create a New Repository

1. Go to [GitHub](https://github.com)
2. Click the "+" icon in the top right
3. Select "New repository"
4. Enter repository name: `usiu-leave-system` (or any name you prefer)
5. Choose "Public" (required for free GitHub Pages)
6. **Do NOT** initialize with README (we'll upload our files)
7. Click "Create repository"

### Step 2: Upload Your Files

1. On your new repository page, click "uploading an existing file"
2. Drag and drop all files from your leave-management-system folder
   - Make sure to include the css and js folders
   - Include all HTML files
   - Include the docs folder and README.md
3. Add commit message: "Initial commit - USIU Leave Management System"
4. Click "Commit changes"

### Step 3: Enable GitHub Pages

1. Go to repository "Settings" tab
2. Scroll down to "Pages" section (in left sidebar)
3. Under "Source", select "main" branch
4. Select "/" (root) folder
5. Click "Save"
6. Wait a few minutes for deployment
7. Your site will be available at: `https://YOUR-USERNAME.github.io/usiu-leave-system/`

## Method 2: Using Git Command Line

### Step 1: Install Git

Download and install Git from [git-scm.com](https://git-scm.com/)

### Step 2: Create Repository on GitHub

Follow Step 1 from Method 1 above.

### Step 3: Initialize Local Repository

Open terminal/command prompt in your project folder:

```bash
# Navigate to your project folder
cd path/to/leave-management-system

# Initialize git repository
git init

# Add all files
git add .

# Commit files
git commit -m "Initial commit - USIU Leave Management System"

# Add remote repository (replace YOUR-USERNAME and REPO-NAME)
git remote add origin https://github.com/YOUR-USERNAME/REPO-NAME.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 4: Enable GitHub Pages

Follow Step 3 from Method 1 above.

## Post-Deployment Steps

### 1. Update Firebase Configuration

**Important**: Before deploying, ensure you've:
- Updated `js/firebase-config.js` with your Firebase credentials
- Set up Firebase Authentication
- Configured Firestore database
- Created an admin user

### 2. Test Your Deployment

1. Visit your GitHub Pages URL
2. Test login functionality
3. Register a test user
4. Submit a leave request
5. Login as admin and approve request
6. Check for any console errors

### 3. Configure Custom Domain (Optional)

If you have a custom domain:

1. Go to repository Settings > Pages
2. Enter your custom domain under "Custom domain"
3. Click "Save"
4. Add DNS records with your domain provider:
   - Type: A
   - Host: @
   - Value: GitHub Pages IP addresses:
     ```
     185.199.108.153
     185.199.109.153
     185.199.110.153
     185.199.111.153
     ```
   - Or use CNAME record pointing to YOUR-USERNAME.github.io

## Updating Your Deployment

### Using Web Interface

1. Go to your repository on GitHub
2. Navigate to the file you want to edit
3. Click the pencil icon to edit
4. Make changes
5. Commit changes

### Using Git Command Line

```bash
# Make your changes locally

# Stage changes
git add .

# Commit changes
git commit -m "Description of changes"

# Push to GitHub
git push origin main
```

Changes will be reflected on GitHub Pages within a few minutes.

## Security Considerations

### Important: Firebase Configuration

Your `firebase-config.js` file contains API keys. While these are safe to expose publicly (Firebase has security rules), consider:

1. **Use Environment Variables** for production:
   - Use GitHub Actions to inject config at build time
   - Keep sensitive data in repository secrets

2. **Restrict Firebase API Keys**:
   - Go to Google Cloud Console
   - Restrict your API key to your domain
   - Add your GitHub Pages URL to allowed domains

3. **Review Firestore Rules**:
   - Ensure rules properly restrict access
   - Test rules in Firebase Console

### Setting Up GitHub Secrets (Advanced)

If you want to use environment variables:

1. Go to repository Settings > Secrets and variables > Actions
2. Click "New repository secret"
3. Add your Firebase configuration as secrets:
   - `FIREBASE_API_KEY`
   - `FIREBASE_AUTH_DOMAIN`
   - etc.

4. Create a GitHub Actions workflow to build and deploy

## Troubleshooting

### Issue: Site shows 404 error
**Solution:**
- Check that GitHub Pages is enabled
- Verify you selected the correct branch and folder
- Wait a few minutes for initial deployment
- Check that `index.html` is in the root directory

### Issue: Files not loading (404 for CSS/JS)
**Solution:**
- Check file paths are correct (case-sensitive)
- Verify folder structure is maintained
- Ensure all files were uploaded

### Issue: Firebase not connecting
**Solution:**
- Verify Firebase configuration is correct
- Check browser console for errors
- Ensure Firebase project is set up properly
- Check that Firestore security rules allow read/write

### Issue: Custom domain not working
**Solution:**
- Verify DNS records are correct
- Wait for DNS propagation (can take 24-48 hours)
- Check that HTTPS is enforced in repository settings
- Try clearing browser cache

## GitHub Actions for Automated Deployment (Advanced)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./
```

This automatically deploys changes when you push to main branch.

## Monitoring Your Deployment

### GitHub Insights

1. Go to repository Insights tab
2. View traffic statistics
3. Monitor popular content
4. Track visitors

### Firebase Usage

1. Monitor Firebase Console
2. Check authentication metrics
3. Review Firestore usage
4. Monitor function invocations (if using)

## Best Practices

1. **Regular Backups**: Export Firestore data regularly
2. **Version Control**: Use meaningful commit messages
3. **Testing**: Test changes locally before deploying
4. **Documentation**: Keep README.md updated
5. **Security**: Review and update security rules
6. **Monitoring**: Check GitHub Pages build status
7. **Updates**: Keep dependencies updated

## Alternative Hosting Options

If GitHub Pages doesn't meet your needs:

### Firebase Hosting
```bash
firebase init hosting
firebase deploy --only hosting
```

### Netlify
1. Connect GitHub repository
2. Auto-deploys on push
3. Free HTTPS and custom domains

### Vercel
1. Import GitHub repository
2. Automatic deployments
3. Free tier available

## Support Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Support](https://support.github.com)
- [Firebase Hosting Docs](https://firebase.google.com/docs/hosting)
- [Git Documentation](https://git-scm.com/doc)

## Quick Reference Commands

```bash
# Clone repository
git clone https://github.com/USERNAME/REPO.git

# Check status
git status

# Add files
git add .

# Commit changes
git commit -m "Message"

# Push changes
git push origin main

# Pull latest changes
git pull origin main

# Create new branch
git checkout -b feature-name

# Switch branches
git checkout main
```

---

**Last Updated**: January 2025
**For Support**: Contact your system administrator
