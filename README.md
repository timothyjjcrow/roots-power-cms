# Roots Power - Modern Electrical Services Website

A modern, responsive website for Roots Power electrical services company with integrated Decap CMS for easy content management.

## Features

### 🎨 Modern Design

- **Responsive & Mobile-First**: Optimized for all devices (mobile, tablet, desktop)
- **Professional UI**: Clean, modern design with smooth animations
- **Fast Loading**: Optimized performance with lazy loading and efficient code
- **Accessibility**: WCAG compliant with proper semantic markup

### ⚡ Interactive Elements

- **Smooth Scrolling**: Seamless navigation between sections
- **Interactive Cards**: Hover effects and animations
- **Mobile Navigation**: Hamburger menu for mobile devices
- **Contact Form**: Integrated Netlify Forms with validation
- **Back to Top**: Convenient scroll-to-top functionality

### 📝 Content Management (Decap CMS)

- **Easy Editing**: Non-technical content editing through web interface
- **Full Content Control**: Edit all text, images, and settings
- **Service Management**: Add, edit, and reorder services
- **Project Portfolio**: Manage project showcase
- **Contact Information**: Update contact details and business info
- **SEO Management**: Control meta tags and descriptions

## File Structure

```
roots-power-cms/
├── admin/                  # Decap CMS admin interface
│   ├── index.html         # CMS admin page
│   └── config.yml         # CMS configuration
├── _data/                 # Content data files (managed by CMS)
│   ├── site.yml          # Site-wide settings
│   ├── hero.yml          # Hero section content
│   ├── services/         # Service pages
│   └── projects/         # Project portfolio
├── images/
│   └── uploads/          # CMS uploaded images
├── logo/                 # Company logos
├── service images/       # Service-related images
├── index.html           # Main website file
├── styles.css           # Stylesheet
├── script.js            # JavaScript functionality
├── netlify.toml         # Netlify configuration
└── README.md            # This file
```

## Setup Instructions

### 1. Deploy to Netlify

1. Fork or clone this repository
2. Connect to Netlify (netlify.com)
3. Deploy from your Git repository
4. Enable Netlify Identity in site settings
5. Enable Git Gateway in Identity settings

### 2. Enable Content Management

1. Go to `yoursite.netlify.app/admin`
2. Click "Login with Netlify Identity"
3. Create your admin account
4. Start editing content through the CMS interface

### 3. Customize Your Content

#### Business Information

- Navigate to **Site Configuration** in the CMS
- Update business details, contact information, and license numbers
- Add social media links if desired

#### Services

- Go to **Services** section in CMS
- Edit existing services or add new ones
- Upload service images
- Reorder services using the "Display Order" field
- Mark important services as "Featured"

#### Hero Section

- Edit the main page hero content
- Update business tagline and description
- Modify call-to-action buttons

#### Projects

- Add project case studies
- Upload project images
- Add project tags and descriptions

#### SEO Settings

- Update meta descriptions and titles
- Add keywords for better search visibility
- Upload Open Graph images for social sharing

## Content Management Features

### 📊 What You Can Edit

- **All Text Content**: Headlines, descriptions, button text
- **Images**: Service photos, project images, logos
- **Contact Information**: Phone, email, address, license
- **Services**: Add/remove/edit all electrical services
- **Projects**: Showcase completed work
- **SEO**: Meta tags, descriptions, keywords
- **Navigation**: Menu items and links
- **Forms**: Contact form options and settings

### 🔒 User Roles

- **Admin**: Full access to all content
- **Editor**: Can edit content but not site settings
- **Contributor**: Can create content for review

### 📱 Mobile CMS

- CMS works on mobile devices
- Edit content from anywhere
- Real-time preview of changes

## Technical Details

### Built With

- **HTML5 & CSS3**: Modern semantic markup
- **Vanilla JavaScript**: No framework dependencies
- **Decap CMS**: Git-based content management
- **Netlify**: Hosting and form handling
- **Font Awesome**: Professional icons
- **Google Fonts**: Custom typography

### Performance Features

- **Optimized Images**: Automatic compression and lazy loading
- **Minified CSS**: Reduced file sizes
- **Efficient JavaScript**: Throttled scroll events and optimizations
- **Caching**: Browser caching for faster repeat visits

### Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

## Customization

### Colors & Branding

Edit the CSS custom properties in `styles.css`:

```css
:root {
  --primary-color: #1e40af; /* Main brand color */
  --secondary-color: #f59e0b; /* Accent color */
  --accent-color: #10b981; /* Success/highlight color */
}
```

### Typography

Update font imports in `index.html` and CSS variables:

```css
--font-primary: "Inter", system-ui, -apple-system, sans-serif;
--font-display: "Playfair Display", serif;
```

## Support & Maintenance

### Regular Updates

- Keep Decap CMS updated for security
- Review and update content regularly
- Monitor site performance
- Update contact information as needed

### Backup

- Content is automatically backed up in Git
- Download content files from the repository
- Export CMS data if needed

### Troubleshooting

- Check browser console for JavaScript errors
- Verify Netlify Identity is enabled
- Ensure Git Gateway is configured
- Check image file sizes (keep under 1MB for best performance)

## Contact

For technical support or customization requests, contact your web developer or:

**Roots Power**

- Phone: (707) 441-9436
- Email: rj@rootspower.com
- Website: https://roots-power.vercel.app

## License

This website is custom-built for Roots Power electrical services. All rights reserved.

---

_Built with ❤️ for professional electrical services in Eureka, CA_
