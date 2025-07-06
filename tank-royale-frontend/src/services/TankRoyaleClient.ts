import { 
  BattleEventMap, 
  WebSocketMessage, 
  ConnectionState,
  ObserverHandshake 
} from '@/types/generated'

export class TankRoyaleClient {
  private ws: WebSocket | null = null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private listeners = new Map<keyof BattleEventMap, Set<(event: any) => void>>()
  private connectionListeners = new Set<(state: ConnectionState) => void>()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 2000
  private reconnectTimer: NodeJS.Timeout | null = null
  private connectionState: ConnectionState = {
    isConnected: false,
    isConnecting: false
  }

  constructor(private serverUrl: string) {}

  /**
   * Connect to the Tank Royale server
   */
  async connect(): Promise<void> {
    if (this.connectionState.isConnecting || this.connectionState.isConnected) {
      return
    }

    this.updateConnectionState({
      isConnecting: true,
      isConnected: false,
      error: undefined,
      serverUrl: this.serverUrl
    })

    try {
      const wsUrl = this.serverUrl.replace(/^http/, 'ws')
      console.log(`🔌 Connecting to Tank Royale server: ${wsUrl}`)
      
      // Validate WebSocket URL
      if (!wsUrl.startsWith('ws://') && !wsUrl.startsWith('wss://')) {
        throw new Error('Invalid WebSocket URL. Must start with ws:// or wss://')
      }
      
      this.ws = new WebSocket(wsUrl)
      
      this.ws.onopen = () => {
        console.log('✅ Connected to Tank Royale server')
        this.reconnectAttempts = 0
        this.updateConnectionState({
          isConnected: true,
          isConnecting: false,
          error: undefined
        })
        
        // Send observer handshake
        this.sendObserverHandshake()
      }
      
      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          this.handleMessage(message)
        } catch (error) {
          console.error('❌ Failed to parse WebSocket message:', error)
        }
      }
      
      this.ws.onclose = (event) => {
        console.log('🔌 Disconnected from Tank Royale server', event.code, event.reason)
        
        let errorMessage = 'Connection closed'
        if (event.code === 1006) {
          errorMessage = 'Connection failed - server may be offline or unreachable'
        } else if (event.code === 1000) {
          errorMessage = 'Connection closed normally'
        } else if (event.reason) {
          errorMessage = event.reason
        }
        
        this.updateConnectionState({
          isConnected: false,
          isConnecting: false,
          error: errorMessage
        })
        
        // Attempt reconnection if not intentional
        if (!event.wasClean && event.code !== 1000) {
          this.attemptReconnect()
        }
      }
      
      this.ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error)
        this.updateConnectionState({
          isConnected: false,
          isConnecting: false,
          error: 'WebSocket connection error - check server URL and network connectivity'
        })
      }
      
    } catch (error) {
      console.error('❌ Failed to connect:', error)
      this.updateConnectionState({
        isConnected: false,
        isConnecting: false,
        error: error instanceof Error ? error.message : 'Unknown connection error'
      })
    }
  }

  /**
   * Disconnect from the server
   */
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnecting')
      this.ws = null
    }
    
    this.updateConnectionState({
      isConnected: false,
      isConnecting: false,
      error: undefined
    })
  }

  /**
   * Send observer handshake to the server
   */
  private sendObserverHandshake(): void {
    const handshake: ObserverHandshake = {
      name: 'Tank Royale Frontend',
      sessionId: this.generateSessionId(),
      version: '1.0'
    }
    
    this.send(handshake)
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return `observer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(message: WebSocketMessage): void {
    if (!message.type) {
      console.warn('⚠️ Received message without type:', message)
      return
    }

    // Map message types to event handlers
    const eventMap: Record<string, keyof BattleEventMap> = {
      'TickEventForObserver': 'tick',
      'GameStartedEventForObserver': 'gameStarted',
      'GameEndedEventForObserver': 'gameEnded',
      'BulletFiredEvent': 'bulletFired',
      'BulletHitBotEvent': 'bulletHitBot',
      'BulletHitWallEvent': 'bulletHitWall',
      'BotDeathEvent': 'botDeath',
      'BotHitBotEvent': 'botHitBot',
      'BotHitWallEvent': 'botHitWall'
    }

    const eventType = eventMap[message.type]
    if (eventType) {
      const handlers = this.listeners.get(eventType)
      if (handlers) {
        handlers.forEach(handler => {
          try {
            handler(message)
          } catch (error) {
            console.error(`❌ Error in ${eventType} handler:`, error)
          }
        })
      }
    } else {
      console.debug('🔍 Unhandled message type:', message.type)
    }
  }

  /**
   * Subscribe to battle events
   */
  on<T extends keyof BattleEventMap>(
    event: T, 
    handler: (data: BattleEventMap[T]) => void
  ): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(handler)
  }

  /**
   * Unsubscribe from battle events
   */
  off<T extends keyof BattleEventMap>(
    event: T, 
    handler: (data: BattleEventMap[T]) => void
  ): void {
    this.listeners.get(event)?.delete(handler)
  }

  /**
   * Subscribe to connection state changes
   */
  onConnectionStateChange(handler: (state: ConnectionState) => void): void {
    this.connectionListeners.add(handler)
    // Immediately call with current state
    handler(this.connectionState)
  }

  /**
   * Unsubscribe from connection state changes
   */
  offConnectionStateChange(handler: (state: ConnectionState) => void): void {
    this.connectionListeners.delete(handler)
  }

  /**
   * Send a message to the server
   */
  send(message: unknown): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      console.warn('⚠️ Cannot send message: WebSocket not connected')
    }
  }

  /**
   * Update connection state and notify listeners
   */
  private updateConnectionState(newState: Partial<ConnectionState>): void {
    this.connectionState = { ...this.connectionState, ...newState }
    this.connectionListeners.forEach(listener => {
      try {
        listener(this.connectionState)
      } catch (error) {
        console.error('❌ Error in connection state listener:', error)
      }
    })
  }

  /**
   * Attempt to reconnect to the server
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached')
      this.updateConnectionState({
        error: 'Max reconnection attempts reached'
      })
      return
    }

    this.reconnectAttempts++
    const delay = this.reconnectDelay * this.reconnectAttempts
    
    console.log(`🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
    
    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(error => {
        console.error('❌ Reconnection failed:', error)
      })
    }, delay)
  }

  /**
   * Get current connection state
   */
  getConnectionState(): ConnectionState {
    return { ...this.connectionState }
  }

  /**
   * Check if currently connected
   */
  isConnected(): boolean {
    return this.connectionState.isConnected
  }
} 