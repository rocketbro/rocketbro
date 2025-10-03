# Sanity Webhook Revalidation Setup

This API route handles on-demand revalidation of cached content when Sanity CMS content is updated.

## How It Works

1. **Webhook Trigger**: When content is created, updated, or deleted in Sanity, a webhook is sent to this endpoint
2. **Signature Validation**: The route validates the request using the shared secret
3. **Cache Invalidation**: Uses Next.js `revalidateTag()` to invalidate cached content based on the document type
4. **Fresh Content**: Next page visit fetches fresh content from Sanity

## Environment Variables

Make sure you have the following environment variable set:

```env
NEXT_PUBLIC_SANITY_HOOK_SECRET=your_webhook_secret_here
```

This should match the secret configured in your Sanity webhook settings.

## Sanity Webhook Configuration

Your webhook should be configured with:

- **URL**: `https://YOUR_DOMAIN/api/revalidate`
- **Trigger on**: Create, Update, Delete
- **HTTP Method**: POST
- **Secret**: Same as `NEXT_PUBLIC_SANITY_HOOK_SECRET`
- **Projections**: `{_type, "slug": slug.current}`

## Usage in Your App

When fetching data from Sanity, use the `sanityFetch()` helper function with tags:

```typescript
import { sanityFetch } from "@/lib/sanity/client";
import { postsQuery } from "@/lib/sanity/queries";

// In your page or component
const posts = await sanityFetch({
  query: postsQuery,
  tags: ["post"], // This tag will be revalidated when post documents change
});
```

### Multiple Tags

You can specify multiple tags to revalidate different document types:

```typescript
const data = await sanityFetch({
  query: myQuery,
  tags: ["post", "author", "category"],
});
```

## Development Mode

In development:
- Cache is disabled (`cache: "no-store"`)
- CDN is enabled for instant updates without webhooks
- You don't need to rely on webhooks for local testing

## Production Mode

In production:
- Cache is enabled (`cache: "force-cache"`)
- CDN is disabled
- Webhooks trigger revalidation automatically
- First visit after revalidation will show updated content

## Response Formats

### Success Response (200)
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

### Invalid Signature (401)
```
Invalid Signature
```

### Missing Document Type (400)
```
Bad Request
```

### Server Error (500)
```
Error message here
```

## Testing

You can test the webhook locally using curl:

```bash
curl -X POST http://localhost:3000/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"_type":"post","slug":"test-post"}'
```

Note: Local testing requires the proper signature header from Sanity, so it's easier to test in production or use Sanity's webhook testing feature.

## Reference

Based on the guide: [Sanity Webhooks and On-demand Revalidation in Next.js](https://victoreke.com/blog/sanity-webhooks-and-on-demand-revalidation-in-nextjs)