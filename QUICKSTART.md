# Quick Start Guide

## 🚀 Get Started in 3 Minutes

### 1. Start the CMS Studio

```bash
npm run sanity:dev
```

The Sanity Studio will open at http://localhost:3333

### 2. Create Your First Content

In Sanity Studio:

1. **Create Settings** (required first!)
   - Click "Settings" in the sidebar
   - Add your site title: "My Awesome Blog"
   - Add a site description
   - Optionally add intro text (rich text)
   - Save!

2. **Create a Category**
   - Click "Categories"
   - Add a title like "Tech"
   - Generate the slug
   - Save!

3. **Create an Author**
   - Click "Authors"
   - Add your name
   - Generate the slug
   - Upload a profile image (optional)
   - Add a bio
   - Save!

4. **Create Your First Post**
   - Click "Posts" → "Create"
   - Add a title
   - Generate the slug
   - Select the author you created
   - Add an excerpt (shows in preview)
   - Upload a main image
   - Select a category
   - Write your content in the body
   - Hit "Publish"!

### 3. Start the Frontend

In a new terminal:

```bash
npm run dev
```

Open http://localhost:3000 to see your blog!

## 🔄 Development Workflow

### When You Change Sanity Schemas

After modifying schema files in `cms/schemaTypes/`:

```bash
npm run typegen
```

This will:
1. Extract the schema from Sanity
2. Generate TypeScript types for your queries
3. Update `lib/sanity/types.ts` with fresh types

### When You Change GROQ Queries

Same command! The typegen will pick up changes in `lib/sanity/queries.ts`:

```bash
npm run typegen
```

### Testing the Build

```bash
npm run build
```

This creates a production build with SSG (all pages pre-rendered).

## 🎨 Customization

### Change the Default Theme

Edit `app/layout.tsx`:

```tsx
// Change from dark to light
<ThemeProvider attribute="class" defaultTheme="light" enableSystem>
```

### Change Colors

Edit `app/globals.css` in the `@theme inline` block:

```css
--color-accent: light-dark(#your-light-color, #your-dark-color);
```

### Change Fonts

Edit `app/layout.tsx` - import different fonts from `next/font/google`

## 📝 Adding New Content Types

1. Create schema in `cms/schemaTypes/newtype.ts`
2. Export it in `cms/schemaTypes/index.ts`
3. Create GROQ query in `lib/sanity/queries.ts`
4. Run `npm run typegen`
5. Use the generated types in your frontend!

## 🔗 Useful Commands

```bash
# Frontend
npm run dev          # Start dev server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint

# Sanity CMS
npm run sanity:dev   # Start Sanity Studio
npm run sanity:deploy # Deploy Studio to Sanity's hosting

# Types
npm run typegen      # Regenerate types from schemas + queries
```

## 🐛 Troubleshooting

### "Cannot find module" errors
Run `npm run typegen` to regenerate types

### Types are outdated
Run `npm run typegen` after changing schemas or queries

### Sanity Studio won't start
```bash
cd cms
npm install
npm run dev
```

### Frontend shows no posts
Make sure you've:
1. Created a Settings document
2. Created at least one Author
3. Created and published at least one Post

## 📚 Next Steps

- Set up webhooks for automatic revalidation (see README.md)
- Deploy to Vercel
- Deploy Sanity Studio: `npm run sanity:deploy`
- Configure your production environment variables

## 🎯 Pro Tips

- Use the "Vision" plugin in Sanity Studio to test GROQ queries
- The dark mode toggle is in the top right of every page
- All images are automatically optimized by Next.js
- The site is fully static (SSG) by default - no server needed!

Enjoy building! 🚀