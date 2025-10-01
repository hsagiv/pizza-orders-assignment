// WebSocket authentication
// This file handles WebSocket connection authentication

import { Socket } from 'socket.io';
import { getSecurityConfig } from '@/config/app.config';

interface AuthenticatedSocket extends Socket {
  user?: {
    id: string;
    role: 'admin' | 'user' | 'guest';
    permissions: string[];
  };
}

export class SocketAuth {
  /**
   * Authenticate WebSocket connection
   */
  public authenticate(socket: AuthenticatedSocket, next: (err?: Error) => void): void {
    try {
      // Extract token from handshake
      const token = this.extractToken(socket);
      
      if (!token) {
        // Allow guest connections
        socket.user = {
          id: 'guest',
          role: 'guest',
          permissions: ['read'],
        };
        return next();
      }

      // Verify token (simplified for demo)
      const user = this.verifyToken(token);
      
      if (user) {
        socket.user = user;
        console.log(`🔐 Authenticated user: ${user.id} (${user.role})`);
      } else {
        // Invalid token, allow as guest
        socket.user = {
          id: 'guest',
          role: 'guest',
          permissions: ['read'],
        };
      }

      next();
    } catch (error) {
      console.error('❌ WebSocket authentication error:', error);
      // Allow connection as guest on auth error
      socket.user = {
        id: 'guest',
        role: 'guest',
        permissions: ['read'],
      };
      next();
    }
  }

  /**
   * Extract token from handshake
   */
  private extractToken(socket: Socket): string | null {
    // Try to get token from query parameters
    const tokenFromQuery = socket.handshake.query.token as string;
    if (tokenFromQuery) {
      return tokenFromQuery;
    }

    // Try to get token from headers
    const authHeader = socket.handshake.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Try to get token from cookies
    const cookies = socket.handshake.headers.cookie;
    if (cookies) {
      const tokenCookie = this.parseCookie(cookies, 'token');
      if (tokenCookie) {
        return tokenCookie;
      }
    }

    return null;
  }

  /**
   * Verify JWT token
   */
  private verifyToken(token: string): any | null {
    try {
      // In a real application, you would verify the JWT token here
      // For demo purposes, we'll use a simple token format
      if (token === 'admin-token') {
        return {
          id: 'admin-1',
          role: 'admin',
          permissions: ['read', 'write', 'admin'],
        };
      }

      if (token === 'user-token') {
        return {
          id: 'user-1',
          role: 'user',
          permissions: ['read', 'write'],
        };
      }

      // Invalid token
      return null;
    } catch (error) {
      console.error('❌ Token verification error:', error);
      return null;
    }
  }

  /**
   * Parse cookie string
   */
  private parseCookie(cookieString: string, name: string): string | null {
    const cookies = cookieString.split(';');
    for (const cookie of cookies) {
      const [key, value] = cookie.trim().split('=');
      if (key === name) {
        return value || null;
      }
    }
    return null;
  }

  /**
   * Check if user has permission
   */
  public hasPermission(socket: AuthenticatedSocket, permission: string): boolean {
    if (!socket.user) {
      return false;
    }

    return socket.user.permissions.includes(permission);
  }

  /**
   * Check if user is admin
   */
  public isAdmin(socket: AuthenticatedSocket): boolean {
    return socket.user?.role === 'admin';
  }

  /**
   * Check if user is authenticated
   */
  public isAuthenticated(socket: AuthenticatedSocket): boolean {
    return socket.user?.role !== 'guest';
  }

  /**
   * Get user info
   */
  public getUser(socket: AuthenticatedSocket): any {
    return socket.user;
  }
}
