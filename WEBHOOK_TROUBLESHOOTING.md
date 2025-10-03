# Webhook Troubleshooting Guide

## Quick Test

### 1. Test the endpoint is reachable

Open this URL in your browser (replace YOUR_SECRET with your actual secret):

```
https://rocketbro.vercel.app/api/revalidate?secret=YOUR_SECRET
```

You should see:
```json
{
  "message": "Webhook endpoint is working!",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "ready": true
}
```

If you get a 401 error, your secret doesn't match or isn't set in Vercel.

### 2. Check Sanity Webhook Configuration

Go to: https://sanity.io/manage

1. Select your project
2. Go to **API** → **Webhooks**
3. Click your webhook (or create a new one)

#### Required Settings:

**URL:**
```
https://rocketbro.vercel.app/api/revalidate?secret=YOUR_SECRET
```

**HTTP Method:** POST

**Trigger on:**
- ✅ Create
- ✅ Update  
- ✅ Delete

**Filter (optional but recommended):**
```groq
_type in ["post", "settings", "author", "category"]
```

**Projection:**
Leave empty OR use:
```groq
{
  _id,
  _type,
  slug,
  title
}
```

**Drafts:** Leave unchecked (unless you want updates on every keystroke)

### 3. Test with a Manual Trigger

In Sanity Studio:
1. Edit a post
2. Click **Publish**
3. Immediately go to Vercel Dashboard → Your Project → Functions → Select "revalidate"
4. Check the logs (they appear in real-time)

You should see logs like:
```
🔔 Revalidation webhook called at: 2024-01-15T10:30:00.000Z
📦 Received webhook payload: {...}
✅ Secret validated successfully
📝 Document type: post
♻️  Revalidating post-related pages...
✅ Revalidation completed successfully
```

### 4. Check Sanity's Webhook Attempts Log

In Sanity (https://sanity.io/manage):
1. Go to your project → API → Webhooks
2. Click the three dots menu on your webhook
3. Select "Attempts log"

This shows:
- ✅ Whether the webhook was delivered (200 status)
- ❌ If it failed (with error details)
- 🔄 If it's being retried

## Common Issues

### Issue 1: "Invalid secret" (401)

**Cause:** Environment variable not set or mismatch

**Fix:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add `SANITY_REVALIDATE_SECRET` with the same value used in webhook URL
3. Redeploy your site

### Issue 2: Webhook reaches endpoint but content doesn't update

**Cause:** Pages were set to `revalidate = false` (already fixed)

**Verify fix is deployed:**
1. Check that your latest deployment includes the changes
2. The pages should NOT have `export const revalidate = false`

### Issue 3: No logs appearing at all

**Causes:**
- Webhook not configured in Sanity
- Wrong URL in Sanity webhook
- Sanity can't reach your domain (Vercel issue)

**Fix:**
1. Double-check webhook URL is exactly: `https://rocketbro.vercel.app/api/revalidate?secret=YOUR_SECRET`
2. Make sure the domain is live and not a preview deployment
3. Check Sanity's "Attempts log" to see what error Sanity is getting

### Issue 4: Payload structure issues

**Symptom:** Logs show "No _type found in payload"

**Fix:**
- Check the "Projection" field in Sanity webhook settings
- If it's empty, Sanity sends the full document (which should work)
- If you customized it, make sure it includes `_type` and `slug`

## Testing Locally

You can't test Sanity webhooks on localhost directly, but you can use ngrok:

1. Install ngrok: `brew install ngrok` (Mac) or download from https://ngrok.com
2. Run your dev server: `npm run dev`
3. In another terminal: `ngrok http 3000`
4. Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)
5. Update Sanity webhook to: `https://abc123.ngrok.io/api/revalidate?secret=YOUR_SECRET`
6. Publish something in Sanity
7. Watch your terminal for logs

Don't forget to change the webhook URL back to production when done!

## Manual Revalidation (Emergency)

If webhooks aren't working and you need to update content NOW:

1. Go to Vercel Dashboard
2. Find your deployment
3. Click "..." → "Redeploy"
4. This rebuilds everything with fresh Sanity data

## Verification Checklist

After deploying the fixes:

- [ ] GET request to `/api/revalidate?secret=XXX` returns 200 OK
- [ ] `SANITY_REVALIDATE_SECRET` is set in Vercel
- [ ] Webhook URL in Sanity includes `?secret=XXX` query parameter
- [ ] Webhook is set to POST method
- [ ] Webhook is enabled (not disabled)
- [ ] Webhook triggers on Create, Update, Delete
- [ ] Published a test post and checked Vercel function logs
- [ ] Checked Sanity webhook "Attempts log" shows 200 status
- [ ] Waited 30 seconds and refreshed the page to see new content

## Still Not Working?

1. **Check the logs in Vercel** - This is the #1 debugging tool
   - Vercel Dashboard → Functions → revalidate function → View logs
   
2. **Check Sanity's attempts log** - Shows if webhook is being sent
   - sanity.io/manage → Your project → API → Webhooks → ... menu → Attempts log

3. **Check the payload** - The logs will show exactly what Sanity is sending

4. **Try a different post** - Maybe one post has an issue

5. **Clear browser cache** - Hard refresh with Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

## Support

If you've tried everything above and it's still not working:
1. Screenshot the Vercel logs
2. Screenshot the Sanity attempts log
3. Share both for debugging