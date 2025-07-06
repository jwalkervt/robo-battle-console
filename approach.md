# Robocode Tank Royale - MVP Next.js Approach

## Overview

This document outlines a pragmatic MVP approach for creating a browser-based Robocode Tank Royale GUI using Next.js 14 + Pixi.js, designed for rapid deployment on Vercel. The goal is to deliver a working spectator view in 2 sprints (4 weeks) and iterate from there.

## Technology Stack

### Core Technologies
- **Framework**: Next.js 14 with App Router
- **Frontend**: React 19 with TypeScript
- **Graphics**: Pixi.js v7+ (WebGL-accelerated 2D rendering)
- **Audio**: Howler.js (battle-tested audio library)
- **WebSocket**: Native WebSocket API with type-safe layer
- **Type Generation**: Quicktype from existing YAML schemas
- **Deployment**: Vercel with Edge Functions
- **Styling**: Tailwind CSS for rapid UI development

### Key Libraries
```json
{
  "dependencies": {
    "next": "14.0.0",
    "react": "19.0.0",
    "react-dom": "19.0.0",
    "pixi.js": "^7.3.0",
    "howler": "^2.2.3",
    "ws": "^8.14.0",
    "tailwindcss": "^3.3.0"
  },
  "devDependencies": {
    "quicktype": "^23.0.0",
    "typescript": "^5.2.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "@types/howler": "^2.2.0"
  }
}
```

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js 14 Application                   │
├─────────────────────────────────────────────────────────────┤
│  React Components │ Pixi.js Renderer │ Vercel Edge Functions │
│  ├─ Battle View    │ ├─ Tank Sprites  │ ├─ WebSocket Proxy    │
│  ├─ Control Panel  │ ├─ Bullet System │ ├─ CORS Handling     │
│  ├─ Server Config  │ ├─ Particle FX   │ └─ TLS Termination   │
│  └─ Audio Controls │ └─ Viewport Mgmt │                      │
├─────────────────────────────────────────────────────────────┤
│  Type-Safe WS     │ Howler.js Audio  │ Auto-Generated Types  │
│  ├─ Schema Types  │ ├─ Sound Loading │ ├─ Battle Messages    │
│  ├─ Message Parse │ ├─ Spatial Audio │ ├─ Bot State Types    │
│  └─ Event Handling│ └─ Volume Control│ └─ Game Events        │
└─────────────────────────────────────────────────────────────┘
```

## Implementation Plan

## Sprint 1: Core Foundation (Weeks 1-2)

### Week 1: Project Setup & Type Generation

#### Day 1-2: Project Initialization
```bash
# Create Next.js project
npx create-next-app@latest robocode-web-gui --typescript --tailwind --app

# Install dependencies
npm install pixi.js howler ws
npm install -D quicktype @types/howler

# Setup type generation
mkdir -p scripts
```

#### Day 3-4: Type Generation from Schemas
```typescript
// scripts/generate-types.ts
import { execSync } from 'child_process'
import { readFileSync, writeFileSync } from 'fs'
import { glob } from 'glob'

async function generateTypes() {
  // Find all YAML schema files
  const schemaFiles = glob.sync('../src/robocode-repo/schema/schemas/*.yaml')
  
  // Generate TypeScript types
  const command = `quicktype --src-lang schema --lang typescript --out src/types/generated.ts ${schemaFiles.join(' ')}`
  execSync(command)
  
  // Add custom exports and utilities
  const generatedTypes = readFileSync('src/types/generated.ts', 'utf8')
  const enhancedTypes = `
${generatedTypes}

// Custom type utilities
export type MessageType = 'TickEvent' | 'GameStarted' | 'GameEnded' | 'BotJoined'
export type EventHandler<T> = (event: T) => void
export type BattleEventMap = {
  tick: TickEvent
  gameStarted: GameStartedEvent
  gameEnded: GameEndedEvent
  botJoined: BotJoinedEvent
}
`
  writeFileSync('src/types/generated.ts', enhancedTypes)
}

generateTypes()
```

#### Day 5: Package.json Scripts
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "generate-types": "tsx scripts/generate-types.ts",
    "prebuild": "npm run generate-types"
  }
}
```

### Week 2: WebSocket Client & Basic UI

#### Day 6-8: Type-Safe WebSocket Client
```typescript
// src/services/RobocodeClient.ts
import { BattleEventMap, TickEvent, GameStartedEvent } from '@/types/generated'

export class RobocodeClient {
  private ws: WebSocket | null = null
  private listeners = new Map<keyof BattleEventMap, Set<Function>>()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5

  constructor(private serverUrl: string) {}

  async connect(): Promise<void> {
    const wsUrl = this.serverUrl.replace(/^http/, 'ws')
    this.ws = new WebSocket(wsUrl)
    
    this.ws.onopen = () => {
      console.log('Connected to Robocode server')
      this.reconnectAttempts = 0
    }
    
    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        this.handleMessage(message)
      } catch (error) {
        console.error('Failed to parse message:', error)
      }
    }
    
    this.ws.onclose = () => {
      console.log('Disconnected from server')
      this.attemptReconnect()
    }
    
    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }
  }

  private handleMessage(message: any): void {
    const messageType = message.type as keyof BattleEventMap
    const handlers = this.listeners.get(messageType)
    
    if (handlers) {
      handlers.forEach(handler => handler(message))
    }
  }

  on<T extends keyof BattleEventMap>(
    event: T, 
    handler: (data: BattleEventMap[T]) => void
  ): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(handler)
  }

  off<T extends keyof BattleEventMap>(
    event: T, 
    handler: (data: BattleEventMap[T]) => void
  ): void {
    this.listeners.get(event)?.delete(handler)
  }

  send(message: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      setTimeout(() => this.connect(), 2000 * this.reconnectAttempts)
    }
  }
}
```

#### Day 9-10: Basic Next.js Pages
```typescript
// src/app/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { BattleViewer } from '@/components/BattleViewer'
import { ServerConnection } from '@/components/ServerConnection'
import { RobocodeClient } from '@/services/RobocodeClient'

export default function Home() {
  const [client, setClient] = useState<RobocodeClient | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  const handleConnect = (serverUrl: string) => {
    const newClient = new RobocodeClient(serverUrl)
    newClient.connect().then(() => {
      setClient(newClient)
      setIsConnected(true)
    })
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Robocode Tank Royale
        </h1>
        
        {!isConnected ? (
          <ServerConnection onConnect={handleConnect} />
        ) : (
          <BattleViewer client={client!} />
        )}
      </div>
    </main>
  )
}
```

## Sprint 2: Graphics & Audio (Weeks 3-4)

### Week 3: Pixi.js Battle Renderer

#### Day 11-13: Pixi.js Setup & Tank Sprites
```typescript
// src/components/BattleRenderer.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import * as PIXI from 'pixi.js'
import { BotState, BulletState, TickEvent } from '@/types/generated'

interface BattleRendererProps {
  width: number
  height: number
  onTick?: (event: TickEvent) => void
}

export function BattleRenderer({ width, height, onTick }: BattleRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const appRef = useRef<PIXI.Application | null>(null)
  const tankSprites = useRef(new Map<number, PIXI.Container>())
  const bulletSprites = useRef(new Map<string, PIXI.Graphics>())

  useEffect(() => {
    if (!canvasRef.current) return

    // Initialize Pixi.js application
    const app = new PIXI.Application({
      view: canvasRef.current,
      width,
      height,
      backgroundColor: 0x1a1a1a,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    })

    appRef.current = app

    // Setup arena background
    const arena = new PIXI.Graphics()
    arena.beginFill(0x000000)
    arena.drawRect(0, 0, 800, 600)
    arena.endFill()
    app.stage.addChild(arena)

    return () => {
      app.destroy(true)
    }
  }, [width, height])

  const createTankSprite = (bot: BotState): PIXI.Container => {
    const container = new PIXI.Container()
    
    // Tank body
    const body = new PIXI.Graphics()
    body.beginFill(0x00ff00)
    body.drawRect(-15, -10, 30, 20)
    body.endFill()
    
    // Tank turret
    const turret = new PIXI.Graphics()
    turret.beginFill(0x00aa00)
    turret.drawRect(-2, -15, 4, 30)
    turret.endFill()
    
    // Tank radar
    const radar = new PIXI.Graphics()
    radar.beginFill(0x0000ff)
    radar.drawRect(-1, -8, 2, 16)
    radar.endFill()
    
    container.addChild(body)
    container.addChild(turret)
    container.addChild(radar)
    
    return container
  }

  const updateTankSprite = (container: PIXI.Container, bot: BotState) => {
    container.x = bot.x
    container.y = height - bot.y // Flip Y coordinate
    container.rotation = -bot.direction * Math.PI / 180
    
    // Update turret rotation
    const turret = container.children[1]
    turret.rotation = -(bot.gunDirection - bot.direction) * Math.PI / 180
    
    // Update radar rotation
    const radar = container.children[2]
    radar.rotation = -(bot.radarDirection - bot.direction) * Math.PI / 180
  }

  const renderTick = (tickEvent: TickEvent) => {
    if (!appRef.current) return

    // Update tanks
    tickEvent.botStates.forEach(bot => {
      let sprite = tankSprites.current.get(bot.id)
      
      if (!sprite) {
        sprite = createTankSprite(bot)
        tankSprites.current.set(bot.id, sprite)
        appRef.current!.stage.addChild(sprite)
      }
      
      updateTankSprite(sprite, bot)
    })

    // Update bullets
    tickEvent.bulletStates.forEach(bullet => {
      const key = `${bullet.bulletId}`
      let sprite = bulletSprites.current.get(key)
      
      if (!sprite) {
        sprite = new PIXI.Graphics()
        sprite.beginFill(0xffff00)
        sprite.drawCircle(0, 0, 3)
        sprite.endFill()
        bulletSprites.current.set(key, sprite)
        appRef.current!.stage.addChild(sprite)
      }
      
      sprite.x = bullet.x
      sprite.y = height - bullet.y
    })

    // Clean up destroyed bullets
    const activeBulletIds = new Set(tickEvent.bulletStates.map(b => `${b.bulletId}`))
    bulletSprites.current.forEach((sprite, key) => {
      if (!activeBulletIds.has(key)) {
        appRef.current!.stage.removeChild(sprite)
        bulletSprites.current.delete(key)
      }
    })
  }

  useEffect(() => {
    if (onTick) {
      // This would be called from the parent component when tick events arrive
    }
  }, [onTick])

  return (
    <canvas
      ref={canvasRef}
      className="border border-gray-600 rounded-lg"
      style={{ maxWidth: '100%', height: 'auto' }}
    />
  )
}
```

#### Day 14-15: Audio Integration
```typescript
// src/services/AudioManager.ts
import { Howl, Howler } from 'howler'

export class AudioManager {
  private sounds = new Map<string, Howl>()
  private masterVolume = 0.7
  private enabled = true

  constructor() {
    this.initializeSounds()
  }

  private initializeSounds(): void {
    // Load sounds from the existing robocode-repo/sounds directory
    const soundConfigs = [
      { name: 'explosion', src: '/sounds/explosion.wav', volume: 0.8 },
      { name: 'gunshot', src: '/sounds/gunshot.wav', volume: 0.6 },
      { name: 'robot_death', src: '/sounds/robot_death.wav', volume: 0.7 },
      { name: 'bullet_hit', src: '/sounds/bullet_hit.wav', volume: 0.5 },
    ]

    soundConfigs.forEach(config => {
      const howl = new Howl({
        src: [config.src],
        volume: config.volume * this.masterVolume,
        preload: true,
      })
      
      this.sounds.set(config.name, howl)
    })
  }

  play(soundName: string, options?: { volume?: number; rate?: number }): void {
    if (!this.enabled) return
    
    const sound = this.sounds.get(soundName)
    if (sound) {
      if (options?.volume) {
        sound.volume(options.volume * this.masterVolume)
      }
      if (options?.rate) {
        sound.rate(options.rate)
      }
      sound.play()
    }
  }

  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume))
    Howler.volume(this.masterVolume)
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled
    if (!enabled) {
      Howler.mute(true)
    } else {
      Howler.mute(false)
    }
  }

  // Play sounds based on battle events
  handleBattleEvent(event: any): void {
    switch (event.type) {
      case 'BulletFiredEvent':
        this.play('gunshot')
        break
      case 'BulletHitBotEvent':
        this.play('bullet_hit')
        break
      case 'BulletHitWallEvent':
        this.play('bullet_hit', { volume: 0.3 })
        break
      case 'BotDeathEvent':
        this.play('robot_death')
        this.play('explosion', { volume: 0.9 })
        break
    }
  }
}
```

### Week 4: Integration & Polish

#### Day 16-18: Complete Battle Viewer
```typescript
// src/components/BattleViewer.tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import { BattleRenderer } from './BattleRenderer'
import { ControlPanel } from './ControlPanel'
import { RobocodeClient } from '@/services/RobocodeClient'
import { AudioManager } from '@/services/AudioManager'
import { TickEvent, GameStartedEvent, GameEndedEvent } from '@/types/generated'

interface BattleViewerProps {
  client: RobocodeClient
}

export function BattleViewer({ client }: BattleViewerProps) {
  const [currentTick, setCurrentTick] = useState<TickEvent | null>(null)
  const [gameState, setGameState] = useState<'waiting' | 'running' | 'ended'>('waiting')
  const [audioManager] = useState(() => new AudioManager())

  const handleTick = useCallback((tickEvent: TickEvent) => {
    setCurrentTick(tickEvent)
    
    // Play audio for events in this tick
    tickEvent.events.forEach(event => {
      audioManager.handleBattleEvent(event)
    })
  }, [audioManager])

  const handleGameStarted = useCallback((event: GameStartedEvent) => {
    setGameState('running')
    console.log('Game started:', event)
  }, [])

  const handleGameEnded = useCallback((event: GameEndedEvent) => {
    setGameState('ended')
    console.log('Game ended:', event)
  }, [])

  useEffect(() => {
    client.on('tick', handleTick)
    client.on('gameStarted', handleGameStarted)
    client.on('gameEnded', handleGameEnded)

    return () => {
      client.off('tick', handleTick)
      client.off('gameStarted', handleGameStarted)
      client.off('gameEnded', handleGameEnded)
    }
  }, [client, handleTick, handleGameStarted, handleGameEnded])

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-1">
        <BattleRenderer
          width={800}
          height={600}
          currentTick={currentTick}
        />
      </div>
      
      <div className="lg:w-80">
        <ControlPanel
          client={client}
          gameState={gameState}
          audioManager={audioManager}
          currentTick={currentTick}
        />
      </div>
    </div>
  )
}
```

#### Day 19-20: Vercel Deployment & Edge Functions

```typescript
// api/ws-proxy.ts - Vercel Edge Function
import { NextRequest } from 'next/server'

export const config = {
  runtime: 'edge',
}

export default async function handler(req: NextRequest) {
  const url = new URL(req.url)
  const serverUrl = url.searchParams.get('server') || 'localhost:7654'
  
  // Handle WebSocket upgrade
  if (req.headers.get('upgrade') === 'websocket') {
    const wsUrl = `ws://${serverUrl}${url.pathname}`
    
    return new Response(null, {
      status: 101,
      headers: {
        'Upgrade': 'websocket',
        'Connection': 'Upgrade',
        'Sec-WebSocket-Accept': generateWebSocketAccept(
          req.headers.get('sec-websocket-key') || ''
        ),
      },
    })
  }
  
  // Handle regular HTTP requests to server
  const targetUrl = `http://${serverUrl}${url.pathname}${url.search}`
  
  return fetch(targetUrl, {
    method: req.method,
    headers: req.headers,
    body: req.body,
  })
}

function generateWebSocketAccept(key: string): string {
  const WEBSOCKET_MAGIC_STRING = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11'
  const crypto = require('crypto')
  return crypto
    .createHash('sha1')
    .update(key + WEBSOCKET_MAGIC_STRING)
    .digest('base64')
}
```

```json
// vercel.json
{
  "functions": {
    "api/ws-proxy.ts": {
      "maxDuration": 30
    }
  },
  "rewrites": [
    {
      "source": "/api/ws/:path*",
      "destination": "/api/ws-proxy"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cross-Origin-Embedder-Policy",
          "value": "require-corp"
        },
        {
          "key": "Cross-Origin-Opener-Policy",
          "value": "same-origin"
        }
      ]
    }
  ]
}
```

## Project Structure

```
robocode-web-gui/
├── src/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── page.tsx           # Main page
│   │   ├── layout.tsx         # Root layout
│   │   └── globals.css        # Global styles
│   ├── components/            # React components
│   │   ├── BattleViewer.tsx   # Main battle interface
│   │   ├── BattleRenderer.tsx # Pixi.js renderer
│   │   ├── ControlPanel.tsx   # Battle controls
│   │   └── ServerConnection.tsx # Server setup
│   ├── services/              # Core services
│   │   ├── RobocodeClient.ts  # WebSocket client
│   │   └── AudioManager.ts    # Sound management
│   └── types/                 # TypeScript definitions
│       └── generated.ts       # Auto-generated from schemas
├── api/                       # Vercel Edge Functions
│   └── ws-proxy.ts           # WebSocket proxy
├── public/                    # Static assets
│   └── sounds/               # Audio files (copied from repo)
├── scripts/                   # Build scripts
│   └── generate-types.ts     # Type generation
├── package.json
├── next.config.js
├── tailwind.config.js
└── vercel.json               # Vercel configuration
```

## Deployment on Vercel

### 1. Repository Setup
```bash
# Initialize git repository
git init
git add .
git commit -m "Initial MVP implementation"

# Push to GitHub
git remote add origin https://github.com/yourusername/robocode-web-gui.git
git push -u origin main
```

### 2. Vercel Configuration
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel

# Set environment variables
vercel env add ROBOCODE_SERVER_URL production
```

### 3. Continuous Deployment
- Connect GitHub repository to Vercel
- Configure automatic deployments on push
- Set up preview deployments for pull requests

## Success Metrics

### Sprint 1 Goals
- [ ] Type-safe WebSocket connection to Robocode server
- [ ] Basic Next.js application structure
- [ ] Auto-generated types from YAML schemas
- [ ] Successful deployment to Vercel

### Sprint 2 Goals
- [ ] Working battle visualization with Pixi.js
- [ ] Tank sprites with proper rotation and movement
- [ ] Bullet rendering and collision effects
- [ ] Audio integration with battle events
- [ ] Responsive design for desktop and mobile

### Performance Targets
- [ ] Initial page load < 2 seconds
- [ ] 60 FPS battle rendering on desktop
- [ ] 30 FPS on mobile devices
- [ ] WebSocket reconnection handling
- [ ] Audio latency < 100ms

## Post-MVP Iterations

### Sprint 3: Enhanced Features
- [ ] Particle effects for explosions
- [ ] Scan arc visualization
- [ ] Tank damage indicators
- [ ] Battle statistics panel

### Sprint 4: Mobile Optimization
- [ ] Touch-friendly controls
- [ ] Responsive canvas sizing
- [ ] Mobile-optimized UI
- [ ] PWA manifest for installation

### Sprint 5: Advanced Features
- [ ] Battle recording to IndexedDB
- [ ] Replay system
- [ ] Multiple server connections
- [ ] Bot upload playground

## Why This Approach Works

1. **Rapid Time-to-Market**: Working spectator view in 2 sprints
2. **Proven Technology Stack**: Next.js 14 + Pixi.js are battle-tested
3. **Type Safety**: Auto-generated types ensure compatibility
4. **Scalable Architecture**: Easy to add features incrementally
5. **Vercel-Optimized**: Edge functions solve deployment challenges
6. **Asset Reuse**: Leverages existing sounds and schemas

This MVP approach gets you to a working product quickly while maintaining a solid foundation for future enhancements. The focus is on shipping fast and iterating based on real user feedback. 
