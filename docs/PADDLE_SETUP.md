# Paddle Integration Setup Guide

This guide will help you set up Paddle for payments and billing in your application.

## 1. Paddle Account Setup

1. Sign up for a Paddle account at [https://www.paddle.com/](https://www.paddle.com/)
2. Complete your business verification
3. Get your API credentials from the Paddle dashboard

## 2. Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# Paddle Configuration
PADDLE_API_KEY=your_paddle_api_key_here
PADDLE_SECRET_KEY=your_paddle_secret_key_here
PADDLE_VENDOR_ID=your_vendor_id_here
NEXT_PUBLIC_PADDLE_VENDOR_ID=your_vendor_id_here
NEXT_PUBLIC_PADDLE_ENVIRONMENT=sandbox  # or 'production'
PADDLE_WEBHOOK_SECRET=your_webhook_secret_here

# Supabase (if not already set)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000  # or your production URL
```

## 3. Create Paddle Products and Prices

1. Go to your Paddle dashboard
2. Create products for each pricing tier:
   - Starter ($9.99/month)
   - Pro ($29.99/month)
   - Enterprise ($99.99/month)

3. For each product, create monthly prices and note the price IDs
4. Update the `paddlePriceId` values in `src/lib/pricing.ts` with your actual price IDs

```typescript
// Example in src/lib/pricing.ts
starter: {
  // ... other properties
  paddlePriceId: 'pri_01hjxxxxxxx', // Replace with actual Paddle price ID
},
pro: {
  // ... other properties
  paddlePriceId: 'pri_01hjyyyyyyy', // Replace with actual Paddle price ID
},
enterprise: {
  // ... other properties
  paddlePriceId: 'pri_01hjzzzzzzz', // Replace with actual Paddle price ID
},
```

## 4. Webhook Setup

1. In your Paddle dashboard, go to Developer Tools > Webhooks
2. Create a new webhook endpoint: `https://yourdomain.com/api/webhooks/paddle`
3. Subscribe to these events:
   - `subscription.created`
   - `subscription.updated`
   - `subscription.cancelled`
   - `payment.succeeded`
   - `payment.failed`

4. Copy the webhook signing secret and add it to your environment variables as `PADDLE_WEBHOOK_SECRET`

## 5. Database Setup

Create the necessary database tables in Supabase:

```sql
-- Add paddle_customer_id to profiles table
ALTER TABLE profiles ADD COLUMN paddle_customer_id TEXT NULL;

-- Create subscriptions table
CREATE TABLE subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  paddle_subscription_id TEXT NOT NULL,
  paddle_customer_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid', 'trialing', 'paused')),
  price_id TEXT NOT NULL,
  paddle_price_id TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  trial_end TIMESTAMP WITH TIME ZONE NULL,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMP WITH TIME ZONE NULL,
  ended_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX subscriptions_user_id_idx ON subscriptions(user_id);
CREATE INDEX subscriptions_paddle_subscription_id_idx ON subscriptions(paddle_subscription_id);
```

## 6. Install Dependencies

```bash
npm install @paddle/paddle-js
```

## 7. Add BillingProvider to App

Wrap your app with the BillingProvider in your layout:

```tsx
// app/layout.tsx
import { BillingProvider } from '@/contexts/BillingContext'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <BillingProvider>
          {children}
        </BillingProvider>
      </body>
    </html>
  )
}
```

## 8. Test the Integration

1. Start your development server: `npm run dev`
2. Navigate to `/billing` to see the pricing page
3. Test the checkout flow with sandbox mode
4. Verify webhook events are being processed correctly

## 9. Production Checklist

- [ ] Switch to production environment in `NEXT_PUBLIC_PADDLE_ENVIRONMENT`
- [ ] Update webhook endpoint to production URL
- [ ] Test with real payment methods
- [ ] Set up proper error monitoring
- [ ] Configure email notifications for billing events

## 10. Security Considerations

- Never expose your secret API keys on the client side
- Always verify webhook signatures
- Use HTTPS for all webhook endpoints
- Implement proper authentication for billing operations
- Set up proper CORS policies

## Troubleshooting

### Common Issues

1. **Webhook verification fails**
   - Check that `PADDLE_WEBHOOK_SECRET` is correctly set
   - Ensure the webhook endpoint is accessible

2. **Checkout session creation fails**
   - Verify your Paddle API keys are correct
   - Check that price IDs match your Paddle products

3. **Subscription updates not reflecting**
   - Check webhook event logs in Paddle dashboard
   - Verify database connection and permissions

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
```

This will provide more detailed logs for webhook processing and API calls.
