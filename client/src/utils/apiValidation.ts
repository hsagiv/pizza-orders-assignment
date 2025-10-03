/**
 * API response validation utilities
 */

import { Order } from '../store/slices/ordersSlice';

/**
 * Validate order data from API response
 */
export const validateOrder = (data: any): Order | null => {
  try {
    if (!data || typeof data !== 'object') {
      return null;
    }

    const { id, title, latitude, longitude, orderTime, status, subItems } = data;

    // Required fields validation
    if (!id || !title || latitude === undefined || longitude === undefined || !orderTime || !status) {
      console.warn('Invalid order data: missing required fields', data);
      return null;
    }

    // Type validation (allow string coordinates to be converted to numbers)
    if (
      typeof id !== 'string' ||
      typeof title !== 'string' ||
      (typeof latitude !== 'number' && typeof latitude !== 'string') ||
      (typeof longitude !== 'number' && typeof longitude !== 'string') ||
      typeof orderTime !== 'string' ||
      typeof status !== 'string'
    ) {
      console.warn('Invalid order data: incorrect field types', data);
      return null;
    }

    // Status validation
    const validStatuses = ['Received', 'Preparing', 'Ready', 'En-Route', 'Delivered'];
    if (!validStatuses.includes(status)) {
      console.warn('Invalid order data: invalid status', data);
      return null;
    }

    // SubItems validation (optional)
    let validatedSubItems = undefined;
    if (subItems && Array.isArray(subItems)) {
      validatedSubItems = subItems.filter(item => 
        item && 
        typeof item.id === 'string' &&
        typeof item.title === 'string' &&
        typeof item.amount === 'number' &&
        typeof item.type === 'string'
      );
    }

    return {
      id,
      title,
      latitude: Number(latitude), // Convert string coordinates to numbers
      longitude: Number(longitude), // Convert string coordinates to numbers
      orderTime,
      status: status as 'Received' | 'Preparing' | 'Ready' | 'En-Route' | 'Delivered',
      subItems: validatedSubItems || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error validating order data:', error);
    return null;
  }
};

/**
 * Validate orders array from API response
 */
export const validateOrdersResponse = (data: any): Order[] => {
  try {
    if (!Array.isArray(data)) {
      console.warn('Invalid orders response: expected array', data);
      return [];
    }

    const validatedOrders = data
      .map(validateOrder)
      .filter((order): order is Order => order !== null);
    
    return validatedOrders;
  } catch (error) {
    console.error('Error validating orders response:', error);
    return [];
  }
};
