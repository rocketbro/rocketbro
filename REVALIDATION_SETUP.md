# Sanity Webhook Revalidation - Setup Guide

This guide explains how the on-demand revalidation system is set up for your Next.js app with Sanity CMS.

## 🎯 What's Been Implemented

Your app now has a complete on-demand revalidation system that automatically updates your statically generated pages when content changes in Sanity CMS.

### Files Created/Modified

1. **`app/api/revalidate/route.ts`** - The webhook endpoint that handles revalidation
2. **`lib/sanity/client.ts`** - Updated with proper cache configuration for development and production
3. **`app/page.tsx`** - Already using proper tags (no changes needed)
4. **`app/blog/[slug]/page.tsx`** - Already using proper tags (no changes needed)

## 🔧 Configuration Required

### 1. Environment Variable

You mentioned the environment variable is already configured. Verify you have this in your `.env.local`:

```env
NEXT_PUBLIC_SANITY_HOOK_SECRET=your_secret_here
```

And in your Vercel/production environment variables.

### 2. Sanity Webhook Setup

Configure your webhook in Sanity at: https://sanity.io/manage

Navigate to your project → **API** → **Webhooks** → **Create webhook**

Use these settings:

```
Name: Next.js Revalidation
Description: Triggers on-demand revalidation in Next.js
URL: https://YOUR_DOMAIN/api/revalidate
Dataset: production (or your dataset name)
Trigger on: ✓ Create, ✓ Update, ✓ Delete
Filter: (leave blank)
Projection: {_type, "slug": slug.current}
Status: ✓ Enable webhook
HTTP Method: POST
Secret: [Same value as NEXT_PUBLIC_SANITY_HOOK_SECRET]
```

**Important:** The projection `{_type, "slug": slug.current}` ensures the webhook sends the document type and slug in the payload.

## 🚀 How It Works

### The Flow

1. **Content Update** → Editor publishes/updates/deletes content in Sanity
2. **Webhook Triggered** → Sanity sends POST request to `/api/revalidate`
3. **Signature Validation** → Route validates request using shared secret
4. **Tag Revalidation** → `revalidateTag(body._type)` invalidates all cached pages with that tag
5. **Fresh Content** → Next visit to any affected page fetches fresh data from Sanity

### Tags Currently Used

Your app already uses these tags correctly:

- **`post`** - Revalidates when any post is created/updated/deleted
- **`settings`** - Revalidates when site settings change
- **`post:${slug}`** - Revalidates specific post pages (granular control)

### Example: What Happens When You Update a Post

```
1. You publish a post in Sanity
2. Sanity webhook sends: {_type: "post", slug: "my-post"}
3. API route calls: revalidateTag("post")
4. All pages with tag "post" are marked for revalidation:
   - Homepage (recent posts)
   - Individual blog post pages
   - generateStaticParams cache
5. Next visitor gets fresh content
```

## 🧪 Development vs Production

### Development Mode (npm run dev)

- **Cache**: Disabled (`cache: "no-store"`)
- **CDN**: Enabled (live API)
- **Behavior**: You see changes immediately without webhooks
- **Why**: Instant feedback during development

### Production Mode (npm run build && npm start)

- **Cache**: Enabled (`cache: "force-cache"`)
- **CDN**: Disabled
- **Behavior**: Pages cached until webhook triggers revalidation
- **Why**: Optimal performance with on-demand updates

## ✅ Testing

### Test the API Route Locally

```bash
# Start your dev server
npm run dev

# In another terminal, test the endpoint
curl -X POST http://localhost:3000/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"_type":"post","slug":"test-post"}'
```

**Note:** Without the proper Sanity signature, you'll get a 401. This is expected and means the security is working.

### Test in Production

1. Deploy your app to Vercel
2. Configure the webhook URL to point to your production domain
3. Make a change in Sanity Studio
4. Check webhook delivery logs in Sanity (API → Webhooks → Click your webhook → Deliveries tab)
5. Visit your site - you should see the updated content on the next page load

### Webhook Delivery Logs

In Sanity's webhook deliveries, you should see:

**Success (200):**
```json
{
  "status": 200,
  "revalidated": true,
  "now": 1234567890,
  "body": {
    "_type": "post",
    "slug": "my-blog-post"
  }
}
```

**Common Issues:**

- **401 Invalid Signature**: Secret mismatch between Sanity and your env variable
- **400 Bad Request**: Missing `_type` in the webhook projection
- **500 Server Error**: Check your server logs for details

## 📝 Adding New Document Types

When you add new document types (e.g., `author`, `category`), update your queries with appropriate tags:

```typescript
// For a new "author" document type
const authors = await sanityFetch({
  query: authorsQuery,
  tags: ["author"], // This will auto-revalidate when authors change
});
```

The webhook will automatically handle revalidation for any `_type` you use in your tags.

## 🔒 Security

The setup includes proper security measures:

1. **Signature Validation**: Uses `parseBody` from `next-sanity/webhook` to verify requests come from your Sanity project
2. **Shared Secret**: Only requests with the correct secret signature are processed
3. **Error Handling**: Proper error responses for invalid requests

## 🐛 Troubleshooting

### Content Not Updating After Publish

1. Check webhook delivery logs in Sanity
2. Verify environment variable is set correctly
3. Ensure projection includes `_type`: `{_type, "slug": slug.current}`
4. Check you're using correct tags in your `sanityFetch` calls
5. Remember: Changes appear on *next* page visit, not immediately

### 401 Invalid Signature

- Verify `NEXT_PUBLIC_SANITY_HOOK_SECRET` matches webhook secret exactly
- Check environment variable is deployed to production
- Redeploy if you just added the env variable

### Changes Not Showing Locally

This is expected! In development, you don't need webhooks because:
- Cache is disabled
- CDN is enabled for live updates
- Just refresh your page to see changes

## 📚 Reference

- [Next.js revalidateTag Documentation](https://nextjs.org/docs/app/api-reference/functions/revalidateTag)
- [Sanity Webhooks Documentation](https://www.sanity.io/docs/webhooks)
- [Original Guide by Victor Eke](https://victoreke.com/blog/sanity-webhooks-and-on-demand-revalidation-in-nextjs)

## ✨ Summary

Your app is now fully configured for on-demand revalidation! The only remaining step is to ensure your Sanity webhook is configured with the correct URL and secret. Once that's done, any content changes in Sanity will automatically trigger cache invalidation in your Next.js app.

**Key Benefits:**
- ⚡ Static page performance with dynamic content updates
- 🎯 Automatic revalidation on publish/update/delete
- 🔒 Secure webhook validation
- 🛠️ Development-friendly with instant updates
- 🌐 Production-optimized with smart caching