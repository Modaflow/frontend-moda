# Supabase Auth Setup

## 🚀 Your app is ready! Running on http://localhost:3001

## Database Setup Required

You need to run the SQL policies in your Supabase dashboard:

1. Go to your Supabase project: https://supabase.com/dashboard/project/ibqnhhmdhttepucndzbw
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase-setup.sql`
4. Run the SQL to enable Row Level Security

## Important Notes

⚠️ **Your custom `users` table conflicts with Supabase Auth**
- Supabase Auth uses `auth.users` automatically
- Your `user_profiles` table should reference `auth.users(id)` via `user_id`
- Consider dropping your custom `users` table

## How It Works

### Authentication Flow
1. **Sign Up**: Creates user in `auth.users` + profile in `user_profiles`
2. **Sign In**: Checks if onboarding completed
3. **Onboarding**: Updates profile with name/phone, marks complete
4. **Redirect**: Goes to integrations page when done

### Security Features
- ✅ Row Level Security (RLS) enabled
- ✅ Users can only access their own data
- ✅ Password hashing handled by Supabase
- ✅ JWT tokens managed automatically
- ✅ Protected routes with middleware

### Database Schema
```sql
-- Supabase manages this automatically
auth.users (id, email, created_at, ...)

-- Your custom profile data
user_profiles (
  id,
  user_id -> auth.users(id),
  full_name,
  phone_number,
  phone_verified,
  onboarding_completed
)
```

## Test the Flow

1. Visit http://localhost:3001
2. Click "Create Account"
3. Enter email/password
4. Complete onboarding (name, phone, integrations)
5. Get redirected to integrations page

## Next Steps

- Run the SQL setup
- Test the auth flow
- Add real phone verification (Twilio)
- Connect actual integrations
- Add proper error handling