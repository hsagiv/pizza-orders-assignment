/**
 * Test API connection and data structure
 */

export const testApiConnection = async () => {
  try {
    console.log('🧪 Testing API connection...');
    
    const response = await fetch('/api/orders');
    console.log('📡 API Response status:', response.status);
    
    if (!response.ok) {
      console.error('❌ API Error:', response.status, response.statusText);
      return;
    }
    
    const data = await response.json();
    console.log('📦 Raw API Response:', data);
    console.log('📊 Response structure:', {
      hasSuccess: 'success' in data,
      hasData: 'data' in data,
      dataType: Array.isArray(data.data) ? 'array' : typeof data.data,
      dataLength: Array.isArray(data.data) ? data.data.length : 'N/A',
      directArray: Array.isArray(data),
      directLength: Array.isArray(data) ? data.length : 'N/A'
    });
    
    return data;
  } catch (error) {
    console.error('❌ API Test Error:', error);
  }
};

// Make it available globally for console testing
(window as any).testApi = testApiConnection;
