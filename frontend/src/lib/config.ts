// API Configuration
export const API_CONFIG = {
  ORDER_SERVICE_URL: process.env.NEXT_PUBLIC_ORDER_SERVICE_URL || 'http://localhost:3001',
  NOTIFICATION_SERVICE_URL: process.env.NEXT_PUBLIC_NOTIFICATION_SERVICE_URL || 'http://localhost:3002',
};

// Check if running in browser
export const isClient = typeof window !== 'undefined';

// For server-side rendering, use internal service names
export const getOrderServiceUrl = () => {
  if (isClient) {
    return API_CONFIG.ORDER_SERVICE_URL;
  }
  // On server side, use localhost for internal communication
  return 'http://localhost:3001';
};

export const getNotificationServiceUrl = () => {
  if (isClient) {
    return API_CONFIG.NOTIFICATION_SERVICE_URL;
  }
  // On server side, use localhost for internal communication  
  return 'http://localhost:3002';
};