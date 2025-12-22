# Supabase Users Migration Guide

## Overview

The users feature has been migrated from mock data to Supabase. All user data is now stored in the `profiles` table in Supabase, which is linked to `auth.users` via a foreign key.

## Database Schema

### Profiles Table

Your existing `profiles` table has the following structure:

```sql
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  username text NULL,
  avatar_url text NULL,
  email text NULL,
  firstname text NULL,
  lastname text NULL,
  phone text NULL,
  address text NULL,
  full_name text NULL,
  role text NULL DEFAULT 'member'::text,
  is_email_verified boolean NULL DEFAULT false,
  is_phone_verified boolean NULL DEFAULT false,
  is_super_admin boolean NULL DEFAULT false,
  banned_until timestamp with time zone NULL,
  providers text NULL,
  status text NULL DEFAULT 'active'::text,
  category text NULL DEFAULT 'Individual'::text,
  country_code text NULL,
  interest_tags text[] NULL DEFAULT array[]::text[],
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);
```

**Important Notes:**
- The `id` field is a foreign key to `auth.users(id)`, meaning profiles are linked to Supabase auth users
- When creating a new user, an auth user must be created first
- The service automatically handles this by creating the auth user, then the profile

## Field Mapping

The frontend User schema maps to the database as follows:

| Frontend Field | Database Field | Notes |
|---------------|----------------|-------|
| `id` | `id` | UUID from auth.users |
| `firstName` | `firstname` | Lowercase, no underscore |
| `lastName` | `lastname` | Lowercase, no underscore |
| `username` | `username` | |
| `email` | `email` | |
| `phoneNumber` | `phone` | |
| `status` | `status` | Default: 'active' |
| `role` | `role` | Default: 'member' |
| `createdAt` | `created_at` | |
| `updatedAt` | `updated_at` | |

## Features Implemented

### ✅ Data Fetching
- Users are fetched from Supabase using React Query
- Automatic caching and refetching
- Loading and error states
- Filters out incomplete profiles (missing firstname/lastname)

### ✅ Create User
- Creates auth user first (via `signUp`)
- Then creates profile linked to auth user
- Validates all required fields
- Handles password securely

### ✅ Update User
- Edit existing users via the "Edit User" dialog
- Updates user information in Supabase
- Maintains user status
- Maps field names correctly (firstname/lastname, phone)

### ✅ Delete User
- Single user deletion with confirmation
- Bulk user deletion
- Removes users from Supabase (CASCADE deletes profile when auth user is deleted)

### ✅ Bulk Actions
- Activate/Deactivate multiple users (updates status)
- Invite multiple users (sets status to 'invited')
- Delete multiple users

## API Functions

All user operations are handled through `src/lib/users-service.ts`:

- `getUsers()` - Fetch all users (filters incomplete profiles)
- `getUserById(id)` - Fetch a single user
- `createUser(user)` - Create auth user + profile (requires password)
- `updateUser(id, updates)` - Update a user profile
- `deleteUser(id)` - Delete a user profile
- `deleteUsers(ids)` - Delete multiple user profiles

## User Creation Flow

When creating a new user:

1. **Auth User Creation**: Creates a Supabase auth user with email/password
2. **Profile Creation**: Creates a profile linked to the auth user ID
3. **Error Handling**: If profile creation fails, logs error (auth user cleanup requires admin API)

## Row Level Security (RLS)

Make sure your RLS policies allow:
- ✅ Authenticated users to read profiles
- ✅ Authenticated users to insert profiles
- ✅ Authenticated users to update profiles
- ✅ Authenticated users to delete profiles

**Note:** Make sure users are authenticated before accessing the users page.

## Role Handling

The frontend uses these roles:
- `superadmin`
- `admin`
- `manager`
- `cashier`

The database defaults to `member` but accepts any text value. The frontend roles will be stored as-is in the database.

## Testing

After ensuring your profiles table exists:

1. **Start the app**: `pnpm dev`
2. **Sign in** to your account
3. **Navigate to** `/users`
4. **Verify**:
   - Users list loads (shows existing profiles)
   - You can add new users (creates auth user + profile)
   - You can edit existing users
   - You can delete users
   - Bulk actions work correctly

## Troubleshooting

### No users showing up?
- Check if profiles exist in your database
- Verify profiles have `firstname` and `lastname` set (incomplete profiles are filtered out)
- Check RLS policies allow authenticated users to read
- Ensure you're authenticated
- Check browser console for errors

### Can't create users?
- Verify RLS policies allow authenticated users to insert
- Check Supabase logs for errors
- Ensure password is provided (required for auth user creation)
- Verify email is unique (both in auth.users and profiles)

### Can't update/delete users?
- Verify RLS policies allow authenticated users to update/delete
- Check Supabase logs for errors
- Ensure user is authenticated

### Type errors?
- Run `pnpm tsc --noEmit` to check for TypeScript errors
- Ensure all dependencies are installed: `pnpm install`

## Important Notes

1. **Auth User Required**: Since profiles are linked to auth.users, creating a profile requires creating an auth user first. The service handles this automatically.

2. **Password Required**: When creating new users, a password is required to create the auth user.

3. **Email Uniqueness**: Emails must be unique in both `auth.users` and `profiles` tables.

4. **CASCADE Delete**: Deleting an auth user will automatically delete the linked profile due to CASCADE constraint.

5. **Incomplete Profiles**: Profiles without `firstname` or `lastname` are filtered out from the users list.
