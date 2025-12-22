import { supabase } from './supabase'
import { type User } from '@/features/users/data/schema'

/**
 * Fetch all users from the profiles table
 */
export async function getUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch users: ${error.message}`)
  }

  // Transform Supabase data to match User schema
  return (data || [])
    .filter((profile) => profile.firstname && profile.lastname) // Filter out incomplete profiles
    .map((profile) => ({
      id: profile.id,
      firstName: profile.firstname || '',
      lastName: profile.lastname || '',
      username: profile.username || '',
      email: profile.email || '',
      phoneNumber: profile.phone || '',
      status: (profile.status || 'active') as User['status'],
      role: (profile.role || 'member') as User['role'],
      createdAt: new Date(profile.created_at),
      updatedAt: new Date(profile.updated_at),
    }))
}

/**
 * Fetch a single user by ID
 */
export async function getUserById(id: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null
    }
    throw new Error(`Failed to fetch user: ${error.message}`)
  }

  if (!data) return null

  return {
    id: data.id,
    firstName: data.firstname || '',
    lastName: data.lastname || '',
    username: data.username || '',
    email: data.email || '',
    phoneNumber: data.phone || '',
    status: (data.status || 'active') as User['status'],
    role: (data.role || 'member') as User['role'],
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  }
}

/**
 * Create a new user profile
 * Since profiles.id is a foreign key to auth.users(id), this function:
 * 1. Creates an auth user first (if password provided)
 * 2. Then creates the profile linked to that auth user
 */
export async function createUser(user: {
  id?: string // Optional: if provided, use this ID (must be from auth.users)
  firstName: string
  lastName: string
  username: string
  email: string
  phoneNumber?: string
  password?: string // Required if creating new auth user
  status: User['status']
  role: User['role']
}): Promise<User> {
  let userId = user.id

  // If no ID provided, create auth user first
  if (!userId) {
    if (!user.password) {
      throw new Error('Password is required to create a new user')
    }

    // Create auth user first
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: user.email,
      password: user.password,
      options: {
        data: {
          first_name: user.firstName,
          last_name: user.lastName,
          username: user.username,
        },
      },
    })

    if (authError) {
      throw new Error(`Failed to create auth user: ${authError.message}`)
    }

    if (!authData.user) {
      throw new Error('Failed to create auth user: No user returned')
    }

    userId = authData.user.id
  }

  // Create profile linked to auth user
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      firstname: user.firstName,
      lastname: user.lastName,
      username: user.username,
      email: user.email,
      phone: user.phoneNumber || null,
      status: user.status,
      role: user.role,
    })
    .select()
    .single()

  if (error) {
    // If profile creation fails, try to clean up auth user
    if (userId && !user.id) {
      // Note: Deleting auth users requires admin API, so we just log the error
      console.error('Failed to create profile, auth user may need manual cleanup:', userId)
    }
    throw new Error(`Failed to create profile: ${error.message}`)
  }

  return {
    id: data.id,
    firstName: data.firstname || '',
    lastName: data.lastname || '',
    username: data.username || '',
    email: data.email || '',
    phoneNumber: data.phone || '',
    status: (data.status || 'active') as User['status'],
    role: (data.role || 'member') as User['role'],
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  }
}

/**
 * Update an existing user profile
 */
export async function updateUser(
  id: string,
  updates: Partial<{
    firstName: string
    lastName: string
    username: string
    email: string
    phoneNumber: string
    status: User['status']
    role: User['role']
  }>
): Promise<User> {
  const updateData: Record<string, unknown> = {}

  if (updates.firstName !== undefined) updateData.firstname = updates.firstName
  if (updates.lastName !== undefined) updateData.lastname = updates.lastName
  if (updates.username !== undefined) updateData.username = updates.username
  if (updates.email !== undefined) updateData.email = updates.email
  if (updates.phoneNumber !== undefined)
    updateData.phone = updates.phoneNumber || null
  if (updates.status !== undefined) updateData.status = updates.status
  if (updates.role !== undefined) updateData.role = updates.role

  const { data, error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update user: ${error.message}`)
  }

  return {
    id: data.id,
    firstName: data.firstname || '',
    lastName: data.lastname || '',
    username: data.username || '',
    email: data.email || '',
    phoneNumber: data.phone || '',
    status: (data.status || 'active') as User['status'],
    role: (data.role || 'member') as User['role'],
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  }
}

/**
 * Delete a user profile
 */
export async function deleteUser(id: string): Promise<void> {
  const { error } = await supabase.from('profiles').delete().eq('id', id)

  if (error) {
    throw new Error(`Failed to delete user: ${error.message}`)
  }
}

/**
 * Delete multiple user profiles
 */
export async function deleteUsers(ids: string[]): Promise<void> {
  const { error } = await supabase.from('profiles').delete().in('id', ids)

  if (error) {
    throw new Error(`Failed to delete users: ${error.message}`)
  }
}

