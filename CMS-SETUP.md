# Roots Power CMS Setup Guide

This guide will help you get the Decap CMS fully working for your Roots Power website.

## Prerequisites

1. **GitHub Repository**: Your site must be in a GitHub repository
2. **Netlify Account**: You need a Netlify account to host the site and enable Git Gateway
3. **Domain**: Your custom domain (optional but recommended)

## Step 1: Deploy to Netlify

1. **Connect GitHub to Netlify**

   - Go to [Netlify](https://netlify.com) and sign up/log in
   - Click "New site from Git"
   - Choose GitHub and authorize Netlify
   - Select your Roots Power repository

2. **Configure Build Settings**
   - Build command: (leave empty)
   - Publish directory: `.` (root directory)
   - Click "Deploy site"

## Step 2: Enable Netlify Identity

1. **Go to Site Settings**

   - In your Netlify dashboard, go to your site
   - Navigate to "Identity" in the left sidebar
   - Click "Enable Identity"

2. **Configure Identity Settings**

   - **Registration preferences**: Set to "Invite only" (recommended)
   - **Git Gateway**: Scroll down and click "Enable Git Gateway"
   - **Services**: Enable any additional services you need

3. **Invite Users**
   - Go to "Identity" > "Users"
   - Click "Invite users"
   - Enter the email addresses of people who should have CMS access
   - Send invitations

## Step 3: Configure Git Gateway

1. **Enable Git Gateway**

   - In Netlify, go to Site Settings > Identity > Services
   - Enable Git Gateway
   - This allows the CMS to commit directly to your GitHub repository

2. **Set Repository Access**
   - Git Gateway will automatically use your repository
   - Ensure the branch is set to `main` (configured in `/admin/config.yml`)

## Step 4: Access the CMS

1. **Admin URL**

   - Your CMS admin interface will be available at: `https://yoursite.netlify.app/admin`
   - Replace `yoursite` with your actual Netlify site name

2. **First Login**
   - Users will receive an email invitation
   - Click the link in the email to set up their password
   - They'll be redirected to the CMS interface

## Step 5: Using the CMS

### Content Management

The CMS is configured to manage:

1. **Site Configuration**

   - Site title, description, contact information
   - Phone number, email, license number
   - Address and social media links

2. **Hero Section**

   - Main title and description
   - Button text and links
   - Feature badges
   - Company badge text

3. **Services**

   - Add, edit, or delete services
   - Upload service images
   - Manage service descriptions and features

4. **Projects Section**

   - Edit the "Our Work" section title and description
   - Control the introductory text for the projects showcase

5. **Projects**
   - Add, edit, or delete individual projects
   - Upload project images
   - Manage project descriptions and tags
   - Set display order for projects
   - Add project tags (Commercial, Residential, Solar, etc.)

### Making Changes

1. **Edit Content**

   - Log into `/admin`
   - Navigate to the content section you want to edit
   - Make your changes
   - Click "Save"

2. **Publish Changes**
   - Click "Publish" to make changes live
   - Changes are committed to GitHub automatically
   - Site rebuilds and updates within minutes

## Step 6: Custom Domain (Optional)

1. **Add Domain**

   - In Netlify, go to Site Settings > Domain management
   - Click "Add custom domain"
   - Enter your domain (e.g., `rootspower.com`)

2. **DNS Configuration**

   - Point your domain's DNS to Netlify
   - Follow Netlify's specific instructions for your domain provider

3. **SSL Certificate**
   - Netlify will automatically provision an SSL certificate
   - Your site will be available over HTTPS

## Step 7: Content Loading

The website is configured to automatically load content from the CMS:

- **Site data**: Loaded from `/_data/site.yml`
- **Hero content**: Loaded from `/_data/hero.yml`
- **Services**: Loaded from `/_data/services/*.yml`
- **Projects section**: Loaded from `/_data/projects-section.yml`
- **Projects**: Loaded from `/_data/projects/*.yml`

Changes made in the CMS will automatically update these files, and the website will reflect the changes immediately.

## Troubleshooting

### CMS Not Loading

- Check that Netlify Identity is enabled
- Verify Git Gateway is enabled
- Ensure users are invited and have accepted invitations

### Changes Not Appearing

- Check the browser console for errors
- Verify the YAML files are being updated in GitHub
- Clear browser cache

### Authentication Issues

- Users must accept email invitations
- Check Identity settings in Netlify
- Verify the site URL is correct in CMS config

### Content Not Loading

- Check browser developer tools for fetch errors
- Verify YAML files exist in `/_data/` directory
- Check file permissions and CORS headers

## Support

For technical issues:

1. Check the browser console for errors
2. Verify all files are committed to GitHub
3. Ensure Netlify build is successful
4. Contact your developer if issues persist

## Content Guidelines

### Images

- **Recommended size**: 1200x800px minimum
- **Format**: JPG, PNG, or WebP
- **File size**: Keep under 2MB for best performance

### Text Content

- **Headlines**: Keep concise and descriptive
- **Descriptions**: Write for your target audience
- **SEO**: Include relevant keywords naturally

### Service Information

- **Be specific**: Detail what's included in each service
- **Use bullet points**: Make information scannable
- **Include CTAs**: Clear calls-to-action for each service

## Security Notes

- **Invite only**: Keep registration set to "invite only"
- **Regular reviews**: Periodically review who has CMS access
- **Strong passwords**: Encourage users to use strong passwords
- **Backup**: Your content is automatically backed up in GitHub
