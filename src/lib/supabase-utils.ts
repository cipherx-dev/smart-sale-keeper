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

export const getCurrentUser = async () => {
  try {
    // Only check Supabase auth - no demo users for security
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Error getting current user:', error);
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
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

// Input sanitization helper
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential XSS characters
    .slice(0, 1000); // Limit length to prevent DoS
};

export const validateNumericInput = (value: any, fieldName: string): { valid: boolean; error?: string; value?: number } => {
  const num = parseFloat(value);
  
  if (isNaN(num)) {
    return { valid: false, error: `${fieldName} must be a valid number` };
  }
  
  if (num < 0) {
    return { valid: false, error: `${fieldName} cannot be negative` };
  }
  
  if (num > 999999.99) {
    return { valid: false, error: `${fieldName} is too large` };
  }
  
  return { valid: true, value: num };
};

// Generic database operations with error handling and validation
export const insertRecord = async (table: string, data: any) => {
  try {
    // Sanitize string inputs
    const sanitizedData = { ...data };
    Object.keys(sanitizedData).forEach(key => {
      if (typeof sanitizedData[key] === 'string') {
        sanitizedData[key] = sanitizeInput(sanitizedData[key]);
      }
    });
    
    const { data: result, error } = await (supabase as any)
      .from(table)
      .insert(sanitizedData)
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
    // Validate ID
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid ID provided');
    }
    
    // Sanitize string inputs
    const sanitizedData = { ...data };
    Object.keys(sanitizedData).forEach(key => {
      if (typeof sanitizedData[key] === 'string') {
        sanitizedData[key] = sanitizeInput(sanitizedData[key]);
      }
    });
    
    const { data: result, error } = await (supabase as any)
      .from(table)
      .update(sanitizedData)
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
    // Validate ID
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid ID provided');
    }
    
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