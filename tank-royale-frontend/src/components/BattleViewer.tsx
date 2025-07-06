'use client'

import { useEffect, useState } from 'react'
import { TankRoyaleClient } from '@/services/TankRoyaleClient'
import { TickEventForObserver, GameStartedEventForObserver, GameEndedEventForObserver } from '@/types/generated'

interface BattleViewerProps {
  client: TankRoyaleClient
}

export function BattleViewer({ client }: BattleViewerProps) {
  const [currentTick, setCurrentTick] = useState<TickEventForObserver | null>(null)
  const [gameState, setGameState] = useState<'waiting' | 'running' | 'ended'>('waiting')
  const [gameInfo, setGameInfo] = useState<GameStartedEventForObserver | null>(null)
  const [eventLog, setEventLog] = useState<string[]>([])

  useEffect(() => {
    const handleTick = (tickEvent: TickEventForObserver) => {
      setCurrentTick(tickEvent)
      
      // Add any tick events to the log
      if (tickEvent.events && tickEvent.events.length > 0) {
        const newEvents = tickEvent.events.map(event => 
          `Turn ${tickEvent.roundNumber}: ${JSON.stringify(event)}`
        )
        setEventLog(prev => [...prev.slice(-20), ...newEvents].slice(-25)) // Keep last 25 events
      }
    }

    const handleGameStarted = (event: GameStartedEventForObserver) => {
      setGameState('running')
      setGameInfo(event)
      setEventLog(prev => [...prev, `Game started with ${event.participants.length} participants`])
      console.log('🎮 Game started:', event)
    }

    const handleGameEnded = (event: GameEndedEventForObserver) => {
      setGameState('ended')
      setEventLog(prev => [...prev, `Game ended after ${event.numberOfRounds} rounds`])
      console.log('🏁 Game ended:', event)
    }

    // Subscribe to events
    client.on('tick', handleTick)
    client.on('gameStarted', handleGameStarted)
    client.on('gameEnded', handleGameEnded)

    return () => {
      client.off('tick', handleTick)
      client.off('gameStarted', handleGameStarted)
      client.off('gameEnded', handleGameEnded)
    }
  }, [client])

  const getBotCount = () => {
    if (!currentTick?.botStates) return 0
    return Array.isArray(currentTick.botStates) ? currentTick.botStates.length : 0
  }

  const getBulletCount = () => {
    if (!currentTick?.bulletStates) return 0
    return Array.isArray(currentTick.bulletStates) ? currentTick.bulletStates.length : 0
  }

  const getGameStateColor = () => {
    switch (gameState) {
      case 'waiting': return 'text-yellow-400'
      case 'running': return 'text-green-400'
      case 'ended': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getGameStateLabel = () => {
    switch (gameState) {
      case 'waiting': return 'Waiting for battle...'
      case 'running': return 'Battle in progress'
      case 'ended': return 'Battle ended'
      default: return 'Unknown state'
    }
  }

  return (
    <div className="space-y-6">
      {/* Battle Status */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Battle Status</h2>
          <span className={`font-medium ${getGameStateColor()}`}>
            {getGameStateLabel()}
          </span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Round:</span>
            <span className="ml-2 font-medium">
              {currentTick?.roundNumber ?? 'N/A'}
            </span>
          </div>
          <div>
            <span className="text-gray-400">Bots:</span>
            <span className="ml-2 font-medium">
              {getBotCount()}
            </span>
          </div>
          <div>
            <span className="text-gray-400">Bullets:</span>
            <span className="ml-2 font-medium">
              {getBulletCount()}
            </span>
          </div>
          <div>
            <span className="text-gray-400">Participants:</span>
            <span className="ml-2 font-medium">
              {gameInfo?.participants ? Array.isArray(gameInfo.participants) ? gameInfo.participants.length : 0 : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Battle Arena Placeholder */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Battle Arena</h3>
        <div className="aspect-video bg-gray-900 rounded-lg border border-gray-600 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-2">🎮</div>
            <p className="text-gray-400">
              {gameState === 'waiting' 
                ? 'Waiting for battle to start...' 
                : 'Battle visualization will appear here'}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              (Pixi.js renderer will be implemented in Sprint 2)
            </p>
          </div>
        </div>
      </div>

      {/* Event Log */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Event Log</h3>
        <div className="bg-gray-900 rounded-lg p-3 h-48 overflow-y-auto">
          {eventLog.length === 0 ? (
            <p className="text-gray-500 text-sm">No events yet...</p>
          ) : (
            <div className="space-y-1">
              {eventLog.map((event, index) => (
                <div key={index} className="text-sm text-gray-300 font-mono">
                  {event}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Debug Information */}
      {currentTick && (
        <details className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <summary className="text-lg font-semibold cursor-pointer">
            Debug Information
          </summary>
          <div className="mt-4 bg-gray-900 rounded-lg p-3 overflow-auto">
            <pre className="text-xs text-gray-300">
              {JSON.stringify(currentTick, null, 2)}
            </pre>
          </div>
        </details>
      )}
    </div>
  )
} 