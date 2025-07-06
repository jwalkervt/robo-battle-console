import { execSync } from 'child_process'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

async function generateTypes() {
  console.log('🔧 Generating TypeScript types from Tank Royale schemas...')
  
  // Path to the Tank Royale schema directory
  const schemaDir = join(__dirname, '../../tank-royale/schema/schemas')
  
  // Check if schema directory exists
  if (!existsSync(schemaDir)) {
    console.error('❌ Schema directory not found:', schemaDir)
    console.log('Please ensure the tank-royale repository is available in the parent directory')
    process.exit(1)
  }
  
  // Key schema files for the frontend
  const keySchemas = [
    'tick-event-for-observer.schema.yaml',
    'game-started-event-for-observer.schema.yaml',
    'game-ended-event-for-observer.schema.yaml',
    'bot-state.schema.yaml',
    'bullet-state.schema.yaml',
    'bot-info.schema.yaml',
    'game-setup.schema.yaml',
    'observer-handshake.schema.yaml',
    'bullet-fired-event.schema.yaml',
    'bullet-hit-bot-event.schema.yaml',
    'bullet-hit-wall-event.schema.yaml',
    'bot-death-event.schema.yaml',
    'bot-hit-bot-event.schema.yaml',
    'bot-hit-wall-event.schema.yaml'
  ]
  
  try {
    // Build the schema file paths
    const schemaPaths = keySchemas
      .map(file => join(schemaDir, file))
      .filter(path => existsSync(path))
    
    if (schemaPaths.length === 0) {
      console.error('❌ No schema files found')
      process.exit(1)
    }
    
    console.log(`📄 Found ${schemaPaths.length} schema files`)
    
    // Generate TypeScript types using quicktype
    const outputPath = join(__dirname, '../src/types/generated.ts')
    const command = `npx quicktype --src-lang schema --lang typescript --out ${outputPath} ${schemaPaths.join(' ')}`
    
    console.log('⚡ Running quicktype...')
    execSync(command, { stdio: 'inherit' })
    
    // Read the generated types
    const generatedTypes = readFileSync(outputPath, 'utf8')
    
    // Add custom type utilities and enhancements
    const enhancedTypes = `/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
${generatedTypes}

// Friendly type aliases for Tank Royale
export type TickEventForObserver = TickEventForObserverSchemaYAMLObject
export type GameStartedEventForObserver = GameStartedEventForObserverSchemaYAMLObject
export type GameEndedEventForObserver = GameEndedEventForObserverSchemaYAMLObject
export type BotState = BotStateSchemaYAMLObject
export type BulletState = BulletStateSchemaYAMLObject
export type BotInfo = BotInfoSchemaYAMLObject
export type GameSetup = GameSetupSchemaYAMLObject
export type ObserverHandshake = ObserverHandshakeSchemaYAMLObject
export type BulletFiredEvent = BulletFiredEventSchemaYAMLObject
export type BulletHitBotEvent = BulletHitBotEventSchemaYAMLObject
export type BulletHitWallEvent = BulletHitWallEventSchemaYAMLObject
export type BotDeathEvent = BotDeathEventSchemaYAMLObject
export type BotHitBotEvent = BotHitBotEventSchemaYAMLObject
export type BotHitWallEvent = BotHitWallEventSchemaYAMLObject

// Custom type utilities for Tank Royale
export type MessageType = 
  | 'TickEventForObserver'
  | 'GameStartedEventForObserver'
  | 'GameEndedEventForObserver'
  | 'BulletFiredEvent'
  | 'BulletHitBotEvent'
  | 'BulletHitWallEvent'
  | 'BotDeathEvent'
  | 'BotHitBotEvent'
  | 'BotHitWallEvent'
  | 'ObserverHandshake'

export type EventHandler<T> = (event: T) => void

export interface BattleEventMap {
  tick: TickEventForObserver
  gameStarted: GameStartedEventForObserver
  gameEnded: GameEndedEventForObserver
  bulletFired: BulletFiredEvent
  bulletHitBot: BulletHitBotEvent
  bulletHitWall: BulletHitWallEvent
  botDeath: BotDeathEvent
  botHitBot: BotHitBotEvent
  botHitWall: BotHitWallEvent
}

// WebSocket message wrapper
export interface WebSocketMessage {
  type: MessageType
  data?: any
}

// Connection state
export interface ConnectionState {
  isConnected: boolean
  isConnecting: boolean
  error?: string
  serverUrl?: string
}

// Audio event types
export interface AudioEvent {
  type: 'explosion' | 'gunshot' | 'hit' | 'death'
  volume?: number
  position?: { x: number; y: number }
}
`
    
    // Write the enhanced types
    writeFileSync(outputPath, enhancedTypes)
    
    console.log('✅ Types generated successfully!')
    console.log(`📍 Output: ${outputPath}`)
    
  } catch (error) {
    console.error('❌ Type generation failed:', error)
    process.exit(1)
  }
}

// Run the type generation
generateTypes().catch(console.error) 