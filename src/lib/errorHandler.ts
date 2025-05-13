export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    // Ensures the error is properly captured by the Error class
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const handleApiError = (error: unknown): string => {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error) {
    // Log the full error for debugging
    console.error('Unexpected error:', error);
    
    // Return a user-friendly message
    return 'An unexpected error occurred. Please try again later.';
  }

  // Handle cases where error is not an Error object
  return 'An unknown error occurred.';
};

export const createApiError = (
  message: string, 
  context?: Record<string, unknown>
): AppError => {
  // Optional: Log additional context for debugging
  if (context) {
    console.error('API Error Context:', context);
  }
  
  return new AppError(message);
}; 