/**
 * WebSocket event types and interfaces
 */

export interface WebSocketOrderUpdate {
  success: boolean;
  data: {
    id: string;
    title: string;
    status: string;
    latitude: number;
    longitude: number;
    orderTime: string;
    subItems?: Array<{
      id: string;
      title: string;
      amount: number;
      type: string;
    }>;
  };
  timestamp: string;
}

export interface WebSocketEvent {
  type: 'order:created' | 'order:updated' | 'order:status-changed' | 'order:deleted';
  payload: WebSocketOrderUpdate;
}
