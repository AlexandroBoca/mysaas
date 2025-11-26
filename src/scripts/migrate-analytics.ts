#!/usr/bin/env tsx

/**
 * Migration script to populate the analytics table with existing data
 * Run this script after creating the analytics table in Supabase
 */

import { createClient } from '@supabase/supabase-js'
import { trackContentGeneration, createSampleAnalyticsData } from '../lib/analytics'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role key for admin operations

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function migrateAnalyticsData() {
  console.log('🚀 Starting analytics data migration...')

  try {
    // Step 1: Check if analytics table exists
    const { data: tables, error: tablesError } = await supabase
      .from('analytics')
      .select('id')
      .limit(1)

    if (tablesError) {
      console.error('❌ Analytics table not found. Please create the analytics table first.')
      console.error('Error:', tablesError.message)
      return
    }

    console.log('✅ Analytics table found')

    // Step 2: Fetch all users
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id')

    if (usersError) {
      console.error('❌ Error fetching users:', usersError.message)
      return
    }

    if (!users || users.length === 0) {
      console.log('ℹ️ No users found. Creating sample data for testing...')
      
      // Create sample data for a test user
      const testUserId = '00000000-0000-0000-0000-000000000000'
      await createSampleAnalyticsData(testUserId)
      console.log('✅ Sample data created successfully!')
      return
    }

    console.log(`📊 Found ${users.length} users to migrate`)

    // Step 3: Migrate data for each user
    for (const user of users) {
      console.log(`🔄 Migrating data for user: ${user.id}`)

      // Fetch user's projects
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)

      if (projectsError) {
        console.warn(`⚠️ Error fetching projects for user ${user.id}:`, projectsError.message)
        continue
      }

      // Fetch user's generations
      const { data: generations, error: generationsError } = await supabase
        .from('generations')
        .select('*')
        .eq('user_id', user.id)

      if (generationsError) {
        console.warn(`⚠️ Error fetching generations for user ${user.id}:`, generationsError.message)
        continue
      }

      if (!projects || !generations) {
        console.log(`ℹ️ No data found for user ${user.id}`)
        continue
      }

      console.log(`📝 Found ${projects.length} projects and ${generations.length} generations`)

      // Create analytics records for each generation
      let migratedCount = 0
      for (const generation of generations) {
        const project = projects.find(p => p.id === generation.project_id)
        
        if (project) {
          const result = await trackContentGeneration({
            user_id: generation.user_id,
            project_id: generation.project_id,
            generation_id: generation.id,
            content_type: project.type || 'blog',
            word_count: Math.round((generation.tokens_used || 0) * 0.75), // Estimate
            tokens_used: generation.tokens_used || 0,
            model_used: generation.model_used || 'gpt-3.5-turbo',
            prompt: generation.prompt || '',
            output: generation.output || ''
          })

          if (result) {
            migratedCount++
          }
        }
      }

      console.log(`✅ Migrated ${migratedCount} records for user ${user.id}`)

      // If user has no existing data, create some sample data
      if (migratedCount === 0) {
        console.log(`ℹ️ No existing data for user ${user.id}. Creating sample data...`)
        await createSampleAnalyticsData(user.id)
      }
    }

    // Step 4: Verify migration
    const { data: analyticsCount, error: countError } = await supabase
      .from('analytics')
      .select('id', { count: 'exact', head: true })

    if (countError) {
      console.error('❌ Error verifying migration:', countError.message)
    } else {
      console.log(`🎉 Migration completed! Total analytics records: ${analyticsCount?.length || 0}`)
    }

  } catch (error) {
    console.error('❌ Migration failed:', error)
  }
}

// Run the migration
migrateAnalyticsData()
  .then(() => {
    console.log('🏁 Migration script finished')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Migration script failed:', error)
    process.exit(1)
  })
