# Automatic Service & Project Discovery

Your Roots Power CMS now has **fully automatic discovery** of services and projects! 🎉

## How It Works

### 🤖 Automatic Registry Updates

- **GitHub Action**: Automatically runs whenever you add/edit services or projects through the CMS
- **Zero Manual Work**: No need to update registries or run scripts manually
- **Real-time Updates**: Changes appear on your website within minutes

### 🔍 Smart Auto-Discovery

The system automatically finds your content using:

#### For Services:

- **100+ File Patterns**: Recognizes files like `emergency-services.yml`, `residential.yml`, `lighting-service.yml`, etc.
- **Common Variations**: Handles abbreviations like `elec.yml`, `electric.yml`, `power.yml`
- **Generic Names**: Even finds files named `a.yml`, `test.yml`, `new.yml`

#### For Projects:

- **Comprehensive Patterns**: Recognizes `commercial-project.yml`, `residential-upgrade.yml`, etc.
- **Numbered Projects**: Automatically finds `project1.yml`, `project-2.yml`, etc.
- **Any Custom Name**: Will discover projects with any filename

### 🎯 Duplicate Prevention

- **Smart Detection**: Prevents loading the same content multiple times
- **Title-Based**: Uses the title field to identify unique items
- **Clean Results**: Only shows each service/project once

## What This Means for You

### ✅ When Adding New Services/Projects:

1. **Use the CMS** - Add through Netlify CMS interface
2. **Name Anything** - Use any filename you want
3. **Automatic Discovery** - It will appear on your website automatically
4. **No Code Changes** - Never need to touch the code again

### ✅ Supported File Patterns:

- `your-service-name.yml`
- `anything-service.yml`
- `anything-services.yml`
- `project-name.yml`
- `anything-project.yml`
- `a.yml`, `b.yml`, `test.yml` (any single word)
- Literally any `.yml` file with a `title` field

### ⚡ Performance:

- **Registry First**: Uses registry for speed when available
- **Fallback Discovery**: Auto-discovers if registry is missing
- **Parallel Loading**: Loads all files simultaneously for maximum speed

## Manual Override (If Needed)

If you ever need to manually update the registry:

```bash
node update-registry.js
```

But you should never need to do this - it's fully automatic now!

## Troubleshooting

If a service/project isn't showing up:

1. **Check the title**: Make sure your YAML file has a `title:` field
2. **Wait a moment**: GitHub Action takes 1-2 minutes to run
3. **Check browser console**: Look for discovery logs with 🔍 and ✅ emojis

The system is designed to find your content no matter what you name it! 🚀
