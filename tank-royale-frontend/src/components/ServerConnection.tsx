'use client'

import { useState } from 'react'

interface ServerConnectionProps {
  onConnect: (serverUrl: string) => void
  isConnecting?: boolean
  connectionError?: string | null
}

export function ServerConnection({ onConnect, isConnecting = false, connectionError }: ServerConnectionProps) {
  const [serverUrl, setServerUrl] = useState('ws://localhost:7655')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (serverUrl.trim() && !isConnecting) {
      onConnect(serverUrl.trim())
    }
  }

  const defaultServers = [
    { name: 'Local Server', url: 'ws://localhost:7655' },
    { name: 'Local Server (HTTP)', url: 'ws://localhost:7655' },
    { name: 'Custom Server', url: '' }
  ]

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold mb-4 text-center">
          Connect to Tank Royale Server
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="serverUrl" className="block text-sm font-medium text-gray-300 mb-2">
              Server URL
            </label>
            <input
              id="serverUrl"
              type="text"
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              placeholder="ws://localhost:7655"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isConnecting}
            />
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-gray-400">Quick connect:</p>
            <div className="space-y-1">
              {defaultServers.map((server, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setServerUrl(server.url)}
                  className="w-full text-left px-3 py-2 text-sm bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
                  disabled={isConnecting}
                >
                  <span className="font-medium">{server.name}</span>
                  {server.url && (
                    <span className="text-gray-400 ml-2">{server.url}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isConnecting || !serverUrl.trim()}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-md text-white font-medium transition-colors"
          >
            {isConnecting ? 'Connecting...' : 'Connect'}
          </button>
        </form>
        
        {/* Connection Error Display */}
        {connectionError && (
          <div className="mt-4 p-3 bg-red-900/50 border border-red-700 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="text-red-400">❌</div>
                <div>
                  <p className="font-medium text-red-300">Connection Failed</p>
                  <p className="text-sm text-red-200">{connectionError}</p>
                </div>
              </div>
              <button
                onClick={() => handleSubmit(new Event('submit') as any)}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm text-white font-medium transition-colors"
                disabled={isConnecting}
              >
                Try Again
              </button>
            </div>
          </div>
        )}
        
        {/* Connection Status */}
        {isConnecting && (
          <div className="mt-4 p-3 bg-yellow-900/50 border border-yellow-700 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="animate-spin text-yellow-400">🔄</div>
              <div>
                <p className="font-medium text-yellow-300">Connecting...</p>
                <p className="text-sm text-yellow-200">Attempting to connect to Tank Royale server</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-6 text-sm text-gray-400">
          <p className="font-medium mb-2">Instructions:</p>
          <ul className="space-y-1 text-xs">
            <li>• Make sure Tank Royale server is running</li>
            <li>• Default port is 7655</li>
            <li>• Use ws:// for WebSocket connections</li>
            <li>• For local development: ws://localhost:7655</li>
          </ul>
        </div>
      </div>
    </div>
  )
} 