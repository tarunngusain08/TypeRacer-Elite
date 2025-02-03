export type ApiError = {
  message: string;
  code?: string;
  status?: number;
};

export const getErrorMessage = (error: any): ApiError => {
  if (error.response) {
    // Server responded with error
    const status = error.response.status;
    switch (status) {
      case 404:
        return {
          message: 'User not found. Please check your credentials.',
          status,
          code: 'USER_NOT_FOUND'
        };
      case 401:
        return {
          message: 'Invalid credentials. Please try again.',
          status,
          code: 'INVALID_CREDENTIALS'
        };
      case 400:
        return {
          message: error.response.data?.message || 'Invalid request. Please check your input.',
          status,
          code: 'INVALID_REQUEST'
        };
      default:
        return {
          message: 'Something went wrong. Please try again later.',
          status,
          code: 'UNKNOWN_ERROR'
        };
    }
  }
  
  if (error.request) {
    // Request was made but no response
    return {
      message: 'Unable to connect to server. Please check your internet connection.',
      code: 'NETWORK_ERROR'
    };
  }
  
  // Something else happened
  return {
    message: 'An unexpected error occurred. Please try again.',
    code: 'UNEXPECTED_ERROR'
  };
}; 