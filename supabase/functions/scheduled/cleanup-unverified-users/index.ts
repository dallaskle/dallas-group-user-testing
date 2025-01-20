import { createClient } from '@supabase/supabase-js'
import { Database } from '../../../src/types/database.types'

// Initialize Supabase client with service role key for admin operations
const supabase = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// This function will be scheduled to run daily
export const cleanupUnverifiedUsers = async () => {
  try {
    console.log('Starting cleanup of unverified users...')

    // Get all users from auth.users who haven't verified their email
    // and were created more than 24 hours ago
    const { data: unverifiedUsers, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) throw authError

    const usersToDelete = unverifiedUsers.users.filter(user => {
      const created = new Date(user.created_at)
      const now = new Date()
      const hoursSinceCreation = (now.getTime() - created.getTime()) / (1000 * 60 * 60)
      return !user.email_confirmed_at && hoursSinceCreation >= 24
    })

    console.log(`Found ${usersToDelete.length} unverified users to delete`)

    // Delete users from both auth and database
    for (const user of usersToDelete) {
      console.log(`Deleting user ${user.id}`)
      
      // Delete from database first (foreign key constraint)
      await supabase
        .from('users')
        .delete()
        .eq('id', user.id)

      // Then delete from auth
      await supabase.auth.admin.deleteUser(user.id)
    }

    console.log('Cleanup completed successfully')
    return { success: true, deletedCount: usersToDelete.length }

  } catch (error) {
    console.error('Error during cleanup:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
} 