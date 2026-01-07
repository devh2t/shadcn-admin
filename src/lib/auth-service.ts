import type { AuthError, Session, User } from '@supabase/supabase-js'
import { supabase } from './supabase'

export interface SignInResult {
  user: User | null
  session: Session | null
  error: AuthError | null
}

export interface SignUpResult {
  user: User | null
  session: Session | null
  error: AuthError | null
}

/**
 * Sign in with email and password
 */
export async function signIn(
  email: string,
  password: string
): Promise<SignInResult> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  return {
    user: data.user,
    session: data.session,
    error,
  }
}

/**
 * Sign up with email and password
 */
export async function signUp(
  email: string,
  password: string,
  profile: {
    first_name: string
    last_name: string
    username: string
    phone_number?: string
  }
): Promise<SignUpResult> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error || !data.user) {
    return { user: null, session: null, error }
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: data.user.id,
      email,
      first_name: profile.first_name,
      last_name: profile.last_name,
      username: profile.username,
      phone_number: profile.phone_number ?? null,
      role: 'cashier',
      status: 'active',
    })

  if (profileError) {
    // eslint-disable-next-line no-console
    console.error('Profile insert failed:', profileError)
    return { user: data.user, session: data.session, error: profileError }
  }

  return { user: data.user, session: data.session, error: null }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.signOut()
  return { error }
}

/**
 * Get the current session
 */
export async function getSession(): Promise<Session | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session
}

/**
 * Get the current user
 */
export async function getUser(): Promise<User | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

/**
 * Refresh the current session
 */
export async function refreshSession(): Promise<{
  session: Session | null
  error: AuthError | null
}> {
  const { data, error } = await supabase.auth.refreshSession()
  return {
    session: data.session,
    error,
  }
}

/**
 * Reset password for email
 */
export async function resetPassword(email: string): Promise<{
  error: AuthError | null
}> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  })
  return { error }
}

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle(): Promise<{ error: AuthError | null }> {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:5173/',
       // `${window.location.origin}/`,
      },
    })
    if (error) throw error
    return { error: null }
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error('Google sign in error:', error)
    return { error }
  }
}

