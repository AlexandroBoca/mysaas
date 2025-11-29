import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

export async function deductCredit(userId: string): Promise<{ success: boolean; creditsRemaining?: number; error?: string }> {
  try {
    console.log('deductCredit called for userId:', userId)
    
    // First, get current credits
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('credits_remaining')
      .eq('id', userId)
      .single()

    if (fetchError) {
      console.error('Error fetching user credits:', fetchError)
      return { success: false, error: 'Failed to check credits' }
    }

    const currentCredits = (profile as any)?.credits_remaining || 0
    console.log('Current credits:', currentCredits)

    // Check if user has enough credits
    if (currentCredits < 1) {
      console.log('Insufficient credits:', currentCredits)
      return { success: false, error: 'Insufficient credits' }
    }

    // Deduct 1 credit
    const newCredits = currentCredits - 1
    console.log('Deducting 1 credit, new total will be:', newCredits)
    
    const updateQuery: any = supabase
      .from('profiles')
      .update({ credits_remaining: newCredits })
      .eq('id', userId)
      .select('credits_remaining')
      .single()
    
    const { data: updatedProfile, error: updateError } = await updateQuery

    if (updateError) {
      console.error('Error deducting credit:', updateError)
      return { success: false, error: 'Failed to deduct credit' }
    }

    const finalCredits = (updatedProfile as any)?.credits_remaining || 0
    console.log('Credit deduction successful, final credits:', finalCredits)

    return { 
      success: true, 
      creditsRemaining: finalCredits 
    }
  } catch (error) {
    console.error('Unexpected error in deductCredit:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getUserCredits(userId: string): Promise<number> {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('credits_remaining')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching user credits:', error)
      return 0
    }

    return (profile as any)?.credits_remaining || 0
  } catch (error) {
    console.error('Unexpected error in getUserCredits:', error)
    return 0
  }
}
