import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Utility functions for Supabase operations with proper error handling

export const handleSupabaseError = (error: any, operation: string) => {
  console.error(`${operation} error:`, error);
  
  let message = 'An unexpected error occurred';
  
  if (error?.message) {
    message = error.message;
  } else if (error?.details) {
    message = error.details;
  }
  
  toast({
    title: `${operation} Failed`,
    description: message,
    variant: "destructive",
  });
  
  return message;
};

export const getCurrentUser = () => {
  // First check localStorage for demo user
  try {
    const storedUser = localStorage.getItem('pos_auth_user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      if (userData.isAuthenticated) {
        return userData;
      }
    }
  } catch (error) {
    console.error('Error getting stored user:', error);
  }
  
  // Then check Supabase auth
  return supabase.auth.getUser();
};

export const withErrorHandling = async <T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<{ data: T | null; error: string | null }> => {
  try {
    const data = await operation();
    return { data, error: null };
  } catch (error) {
    const errorMessage = handleSupabaseError(error, operationName);
    return { data: null, error: errorMessage };
  }
};

// Real-time subscription helpers
export const subscribeToTable = (
  table: string,
  callback: (payload: any) => void,
  filter?: string
) => {
  const subscription = supabase
    .channel(`${table}-changes`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: table,
        filter: filter,
      },
      callback
    )
    .subscribe();

  return subscription;
};

export const unsubscribeFromTable = (subscription: any) => {
  if (subscription) {
    supabase.removeChannel(subscription);
  }
};

// Generic database operations with error handling
export const insertRecord = async (table: string, data: any) => {
  try {
    const { data: result, error } = await (supabase as any)
      .from(table)
      .insert(data)
      .select()
      .maybeSingle();
      
    if (error) {
      throw error;
    }
    
    return { data: result, error: null };
  } catch (error) {
    const errorMessage = handleSupabaseError(error, 'Insert');
    return { data: null, error: errorMessage };
  }
};

export const updateRecord = async (table: string, id: string, data: any) => {
  try {
    const { data: result, error } = await (supabase as any)
      .from(table)
      .update(data)
      .eq('id', id)
      .select()
      .maybeSingle();
      
    if (error) {
      throw error;
    }
    
    return { data: result, error: null };
  } catch (error) {
    const errorMessage = handleSupabaseError(error, 'Update');
    return { data: null, error: errorMessage };
  }
};

export const deleteRecord = async (table: string, id: string) => {
  try {
    const { error } = await (supabase as any)
      .from(table)
      .delete()
      .eq('id', id);
      
    if (error) {
      throw error;
    }
    
    return { success: true, error: null };
  } catch (error) {
    const errorMessage = handleSupabaseError(error, 'Delete');
    return { success: false, error: errorMessage };
  }
};