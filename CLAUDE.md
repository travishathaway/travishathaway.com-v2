# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal blog and portfolio website built with Eleventy (11ty), a static site generator. The site includes blog posts, project showcases, music pages, and a resume.

## Development Commands

```bash
# Install dependencies
npm install

# Build the site (output to _site/)
npm run build

# Serve locally with live reload at http://localhost:8080
npm run serve
# or
npm start

# Watch for changes without serving
npm run watch

# Debug mode with verbose logging
npm run debug
```

## Site Architecture

### Directory Structure

- **posts/** - Blog posts in markdown or directories with index.md
  - Posts can be standalone `.md` files or directories containing `index.md` with associated assets
  - All posts automatically get the "posts" tag via `posts/posts.json`
  - Post filenames typically follow pattern: `YYYY-MM-DD-slug.md` or `YYYY-MM-DD-slug/index.md`

- **_includes/** - Nunjucks templates and inline CSS
  - `layouts/base.njk` - Main HTML structure with header, nav, aside (tags), and footer
  - `layouts/post.njk` - Blog post layout with featured image support
  - `layouts/home.njk` - Home page layout
  - `css/` - CSS files that are inlined and minified via the `cssmin` filter

- **_data/** - Global data files
  - `metadata.json` - Site metadata (title, URL, feed config, author info)

- **_site/** - Build output directory (generated, not committed)

- **img/** - Images, copied as-is to output
- **css/** - External CSS files, copied as-is to output
- **projects/** - Project showcase pages
- **resume/** - Resume page with images
- **music/** - Music-related pages

### Eleventy Configuration (.eleventy.js)

Key configurations:
- **Template Engine**: Nunjucks for HTML/Markdown preprocessing
- **Markdown Library**: markdown-it with anchor links enabled (permalink symbol: #)
- **Plugins**: RSS feed, syntax highlighting (Prism), navigation
- **Passthrough Copy**: `img/` and `css/` directories
- **Template Formats**: md, njk, html, liquid, plus static assets (jpg, png, svg, webp, js, css, woff, woff2, ttf, json, mp3)

### Custom Filters

Defined in `.eleventy.js`:
- `readableDate` - Format dates for display (e.g., "21 Dec 2025")
- `htmlDateString` - Format dates for HTML datetime attributes
- `cssmin` - Minify CSS using clean-css
- `filterTagList` - Remove system tags (all, nav, post, posts) from tag lists
- `head` - Get first n elements of array

### Custom Collections

- `tagList` - Aggregates all unique tags across all content

### Post Front Matter

Blog posts use YAML front matter with these fields:
```yaml
---
author: Travis Hathaway
title: "Post Title"
date: YYYY-MM-DD
description: Brief description for meta tags
featured_image: "/img/post_images/slug"  # Without extension
featured_image_thumbnail: "/img/post_images/slug-800"
show_featured_image: true  # Show hero image at top of post
tags: [Tag1, Tag2]
layout: layouts/post.njk
feature_image_credits: 'HTML for image credits'
---
```

### Navigation

Pages with `eleventyNavigation` key in front matter appear in the main navigation. The navigation is rendered in `_includes/layouts/base.njk` using the eleventy-navigation plugin.

### Featured Images

Posts support featured images via front matter:
- Set `show_featured_image: true` to display a hero image
- Provide `featured_image` path without extension (both .jpg and .webp should exist)
- Image is displayed as a background with title overlay
- Image credits can be included via `feature_image_credits`

## Content Guidelines

- Blog posts live in `posts/` directory
- Use date-based filenames: `YYYY-MM-DD-title.md`
- For posts with multiple assets (images, data files), create a directory `YYYY-MM-DD-title/` with `index.md`
- Images should have both standard and WebP versions for featured images
- Tag system is automatic - all posts get "posts" tag, additional tags in front matter
