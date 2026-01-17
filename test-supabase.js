const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tmxkdwwdiftcldhsxubd.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRteGtkd3dkaWZ0Y2xkaHN4dWJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcyOTQzNzMsImV4cCI6MjA4Mjg3MDM3M30.Mdy9cRY7JVb7LHtTtzeNWjtLwwBFQsHEnq_o94HbFSc'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    console.log('Testing Supabase connection...')

    // Test 1: Check if we can query losses table
    const { data: losses, error: lossesError } = await supabase
      .from('losses')
      .select('*')
      .limit(5)

    if (lossesError) {
      console.error('Error querying losses:', lossesError.message)
    } else {
      console.log(`✓ Successfully queried losses table (${losses.length} rows)`)
    }

    // Test 2: Check if we can query users table
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, username')
      .limit(5)

    if (usersError) {
      console.error('Error querying users:', usersError.message)
    } else {
      console.log(`✓ Successfully queried users table (${users.length} users)`)
      if (users.length > 0) {
        console.log('First user:', users[0])
      }
    }

    // Test 3: Check database schema for losses table
    const { data: schema, error: schemaError } = await supabase
      .from('losses')
      .select('*')
      .limit(1)

    if (!schemaError && schema) {
      console.log('\n✓ Losses table schema looks good')
      console.log('Sample columns available:', Object.keys(schema[0] || {}))
    }

  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

testConnection()
