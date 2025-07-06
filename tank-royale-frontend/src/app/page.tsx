'use client'

import { useState } from 'react'
import { ServerConnection } from '@/components/ServerConnection'
import { BattleViewer } from '@/components/BattleViewer'
import { TankRoyaleClient } from '@/services/TankRoyaleClient'

export default function Home() {
  const [client, setClient] = useState<TankRoyaleClient | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)

  const handleConnect = (serverUrl: string) => {
    console.log('🔌 Connecting to server:', serverUrl)
    setIsConnecting(true)
    setConnectionError(null)
    
    const newClient = new TankRoyaleClient(serverUrl)
    
    // Listen for connection state changes
    newClient.onConnectionStateChange((state) => {
      console.log('🔄 Connection state changed:', state)
      setIsConnected(state.isConnected)
      setIsConnecting(state.isConnecting)
      
      if (state.isConnected) {
        setClient(newClient)
        setConnectionError(null)
      } else if (state.error) {
        console.error('Connection error:', state.error)
        setConnectionError(state.error)
      }
    })
    
    // Start connection with timeout
    const connectTimeout = setTimeout(() => {
      if (!newClient.isConnected()) {
        setConnectionError('Connection timeout - please check server URL and ensure Tank Royale server is running')
        setIsConnecting(false)
        newClient.disconnect()
      }
    }, 10000) // 10 second timeout
    
    newClient.connect().catch(error => {
      console.error('Failed to connect:', error)
      setConnectionError(`Connection failed: ${error.message || 'Unknown error'}`)
      setIsConnecting(false)
      clearTimeout(connectTimeout)
    })
  }

  const handleDisconnect = () => {
    if (client) {
      client.disconnect()
      setClient(null)
      setIsConnected(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Tank Royale
          </h1>
          <p className="text-gray-400">
            Real-time battle viewer for Tank Royale robot combat
          </p>
        </header>
        
        {!isConnected ? (
          <ServerConnection 
            onConnect={handleConnect} 
            isConnecting={isConnecting}
            connectionError={connectionError}
          />
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-400">
                  Connected to Tank Royale server
                </span>
              </div>
              <button
                onClick={handleDisconnect}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white text-sm font-medium transition-colors"
              >
                Disconnect
              </button>
            </div>
            <BattleViewer client={client!} />
          </div>
        )}
      </div>
    </main>
  )
}
