# Rocketbro Blog

A lightweight, SEO-optimized blog built with Next.js 14 (App Router), Sanity CMS, and Tailwind CSS v4. Features static site generation (SSG), dark/light mode toggle, and automatic revalidation via webhooks.

## Features

- ⚡ **Next.js 14 App Router** with TypeScript
- 🎨 **Tailwind CSS v4** (configuration-free, all in CSS)
- 📝 **Sanity CMS** with Portable Text rendering
- 🌓 **Dark/Light Mode** toggle (default: dark)
- 🔍 **SEO Optimized** with Schema.org structured data
- 🚀 **Static Site Generation (SSG)** for maximum performance
- 🔄 **Webhook Revalidation** for automatic updates
- 🎯 **Type-Safe GROQ Queries** with Sanity Typegen
- ♿ **Accessible** with semantic HTML and ARIA labels

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS v4
- **CMS**: Sanity v3
- **Fonts**: 
  - Headings: Wix Madefor Display
  - Body: EB Garamond
  - Code: IBM Plex Mono ExtraLight
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Sanity account and project (you'll set this up)

### 1. Clone and Install

```bash
cd rocketbro
npm install
```

### 2. Set Up Sanity CMS

Since you're setting up Sanity manually, you'll need to:

1. Create a Sanity project at [sanity.io](https://www.sanity.io/)
2. Set up the following schemas in your Sanity Studio:

#### Category Schema (`category.ts`)
```typescript
{
  name: 'category',
  title: 'Category',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title' },
      validation: Rule => Rule.required()
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text'
    }
  ]
}
```

#### Author Schema (`author.ts`)
```typescript
{
  name: 'author',
  title: 'Author',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name' }
    },
    {
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
      fields: [
        {
          name: 'alt',
          title: 'Alt Text',
          type: 'string'
        }
      ]
    },
    {
      name: 'bio',
      title: 'Bio',
      type: 'text'
    }
  ]
}
```

#### Post Schema (`post.ts`)
```typescript
{
  name: 'post',
  title: 'Post',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title' },
      validation: Rule => Rule.required()
    },
    {
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{ type: 'author' }]
    },
    {
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      validation: Rule => Rule.required()
    },
    {
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 4
    },
    {
      name: 'mainImage',
      title: 'Main Image',
      type: 'image',
      options: { hotspot: true },
      fields: [
        {
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
          validation: Rule => Rule.required()
        }
      ]
    },
    {
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'category' }] }]
    },
    {
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [
        { type: 'block' },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            {
              name: 'alt',
              title: 'Alt Text',
              type: 'string'
            }
          ]
        },
        {
          type: 'code',
          options: {
            language: 'javascript'
          }
        }
      ]
    },
    {
      name: 'seo',
      title: 'SEO',
      type: 'object',
      fields: [
        {
          name: 'metaTitle',
          title: 'Meta Title',
          type: 'string'
        },
        {
          name: 'metaDescription',
          title: 'Meta Description',
          type: 'text',
          rows: 3
        },
        {
          name: 'ogImage',
          title: 'Open Graph Image',
          type: 'image',
          fields: [
            {
              name: 'alt',
              title: 'Alt Text',
              type: 'string'
            }
          ]
        }
      ]
    }
  ]
}
```

#### Settings Schema (`settings.ts`)
```typescript
{
  name: 'settings',
  title: 'Settings',
  type: 'document',
  fields: [
    {
      name: 'siteTitle',
      title: 'Site Title',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'siteDescription',
      title: 'Site Description',
      type: 'text',
      validation: Rule => Rule.required()
    },
    {
      name: 'introText',
      title: 'Intro Text',
      type: 'array',
      of: [{ type: 'block' }]
    },
    {
      name: 'socialLinks',
      title: 'Social Links',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'platform',
              title: 'Platform',
              type: 'string'
            },
            {
              name: 'url',
              title: 'URL',
              type: 'url'
            }
          ]
        }
      ]
    },
    {
      name: 'seo',
      title: 'Default SEO',
      type: 'object',
      fields: [
        {
          name: 'metaTitle',
          title: 'Meta Title',
          type: 'string'
        },
        {
          name: 'metaDescription',
          title: 'Meta Description',
          type: 'text'
        }
      ]
    }
  ]
}
```

3. After setting up schemas, run Sanity Typegen:
```bash
npx sanity@latest typegen generate
```

This will generate TypeScript types in your Sanity project. Copy them to `lib/sanity/types.ts` to replace the placeholder types.

### 3. Configure Environment Variables

Update `.env.local` with your Sanity project details:

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=your_actual_project_id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_REVALIDATE_SECRET=create_a_random_secret_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

To get your Sanity Project ID:
1. Go to [sanity.io/manage](https://sanity.io/manage)
2. Select your project
3. Copy the Project ID

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your blog.

### 5. Create Content in Sanity

1. Go to your Sanity Studio (typically at `your-studio-url.sanity.studio`)
2. Create a Settings document (singleton)
3. Create some Categories
4. Create an Author
5. Create your first Post

## Setting Up Webhook Revalidation

Once deployed to Vercel, set up automatic revalidation:

1. Deploy to Vercel and note your production URL
2. In your Sanity project dashboard, go to **API** → **Webhooks**
3. Create a new webhook:
   - **Name**: Vercel Revalidation
   - **URL**: `https://yourdomain.com/api/revalidate?secret=YOUR_SECRET_KEY`
   - **Dataset**: production
   - **Trigger on**: Create, Update, Delete
   - **Filter**: Leave blank (or customize for specific document types)
4. Save the webhook

Now, whenever you publish/update content in Sanity, your site will automatically rebuild those pages!

## Deployment to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables:
   - `NEXT_PUBLIC_SANITY_PROJECT_ID`
   - `NEXT_PUBLIC_SANITY_DATASET`
   - `SANITY_REVALIDATE_SECRET`
   - `NEXT_PUBLIC_SITE_URL`
5. Deploy!

## Project Structure

```
rocketbro/
├── app/
│   ├── api/revalidate/       # Webhook endpoint
│   ├── blog/[slug]/          # Individual blog posts
│   ├── layout.tsx            # Root layout with fonts & theme
│   ├── page.tsx              # Landing page
│   └── globals.css           # Tailwind v4 config
├── components/
│   ├── PortableTextRenderer.tsx
│   ├── PostCard.tsx
│   ├── SchemaOrg.tsx
│   ├── ThemeProvider.tsx
│   └── ThemeToggle.tsx
├── lib/
│   └── sanity/
│       ├── client.ts         # Sanity client
│       ├── image.ts          # Image URL builder
│       ├── queries.ts        # GROQ queries with defineQuery
│       └── types.ts          # TypeScript types
└── public/
```

## Customization

### Fonts
Fonts are configured in `app/layout.tsx`. To change them, update the imports from `next/font/google` and the CSS variables in `app/globals.css`.

### Colors
Colors are configured in `app/globals.css` using CSS variables. Modify the `@theme inline` block to change the color scheme.

### Default Theme
To change the default theme from dark to light, update `app/layout.tsx`:
```tsx
<ThemeProvider attribute="class" defaultTheme="light" enableSystem>
```

## Schema.org & SEO

The site automatically generates Schema.org structured data for:
- `WebSite` on the homepage
- `BlogPosting` on individual blog posts

This helps search engines understand your content better and can result in rich snippets in search results.

## Performance

- **SSG**: All pages are statically generated at build time
- **Image Optimization**: Next.js `<Image>` component with Sanity's image CDN
- **Font Optimization**: Google Fonts loaded with `next/font`
- **Code Splitting**: Automatic with App Router

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.