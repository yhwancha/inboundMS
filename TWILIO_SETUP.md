# Twilio SMS Setup Guide

This guide will help you set up Twilio for SMS notifications in the Check In feature.

## Step 1: Create a Twilio Account

1. Go to [https://www.twilio.com/try-twilio](https://www.twilio.com/try-twilio)
2. Sign up for a free account
3. Verify your email and phone number

## Step 2: Get Your Twilio Credentials

1. Go to the [Twilio Console](https://console.twilio.com/)
2. From the dashboard, copy your:
   - **Account SID** (starts with AC...)
   - **Auth Token** (click "Show" to reveal it)

## Step 3: Get a Twilio Phone Number

1. In the Twilio Console, go to **Phone Numbers** → **Manage** → **Buy a number**
2. Choose a US phone number (free trial includes $15 credit)
3. Select a number with SMS capabilities
4. Purchase the number

## Step 4: Configure Environment Variables

Create a `.env.local` file in the project root with the following:

```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+15551234567
NOTIFICATION_PHONE_NUMBER=+15559876543
```

Replace:
- `TWILIO_ACCOUNT_SID`: Your Account SID from the Twilio Console
- `TWILIO_AUTH_TOKEN`: Your Auth Token from the Twilio Console
- `TWILIO_PHONE_NUMBER`: Your Twilio phone number (format: +1XXXXXXXXXX)
- `NOTIFICATION_PHONE_NUMBER`: The phone number that will receive check-in notifications

## Step 5: Verify Your Phone Number (Trial Account)

If you're using a trial account:
1. Go to **Phone Numbers** → **Manage** → **Verified Caller IDs**
2. Add and verify the phone number that will receive notifications
3. Trial accounts can only send SMS to verified numbers

## Step 6: Test the Setup

1. Restart your development server:
   ```bash
   pnpm dev
   ```

2. Go to the Check In page
3. Enter a container number and phone number
4. Click "Submit Check In"
5. You should receive an SMS notification!

## SMS Message Format

The notification will include:
- 🚛 Container Check-In Alert
- Container Number
- Driver's Contact Phone
- Check-in Timestamp
- Ready for unloading message

## Troubleshooting

### SMS not sending?
- Check that all environment variables are set correctly
- Verify your Twilio phone number has SMS capabilities
- For trial accounts, ensure the destination number is verified
- Check the Twilio Console logs for error messages

### Environment variables not loading?
- Make sure `.env.local` is in the project root
- Restart your development server after adding/changing variables
- Ensure variable names match exactly (case-sensitive)

### Trial account limitations?
- Free trial includes $15 credit
- Can only send to verified phone numbers
- Upgrade to a paid account to remove restrictions

## Cost Estimate

- **US SMS**: ~$0.0075 per message
- **Phone number rental**: ~$1.15/month
- **Free trial credit**: $15 (enough for ~2,000 messages)

## Need Help?

- [Twilio Documentation](https://www.twilio.com/docs/sms)
- [Twilio Support](https://support.twilio.com/)
- [Twilio Console](https://console.twilio.com/)



