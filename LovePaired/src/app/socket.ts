import { io, type Socket } from 'socket.io-client'
import type { MoodKey, Profile } from './types'

export type ServerToClientEvents = {
  'state:self': (payload: {
    self: {
      userId: string
      name: string
      blobColorKey: string
      currentMood: MoodKey
      moodUpdatedAt: number
      missYouCount: number
    }
  }) => void
  'state:partner': (payload: {
    partner: {
      userId: string
      name: string
      blobColorKey: string
      currentMood: MoodKey
      moodUpdatedAt: number
      missYouCount: number
    }
    lastUnreadNote?: { id: string; emotionKey: MoodKey; content: string; createdAt: number }
  }) => void
  'note:new': (payload: { id: string; fromUserId: string; emotionKey: MoodKey; content: string; createdAt: number }) => void
  'note:read': (payload: { noteId: string; byUserId: string }) => void
  ping: (payload: { fromUserId: string; toUserId: string; missYouCount: number; at: number }) => void
  'mood:set': (payload: { userId: string; mood: MoodKey; at: number }) => void
}

export type ClientToServerEvents = {
  hello: (payload: {
    coupleId: string
    userId: string
    name: string
    blobColorKey: string
  }) => void
  ping: (payload: { coupleId: string; fromUserId: string }) => void
  'mood:set': (payload: { coupleId: string; userId: string; mood: MoodKey }) => void
  'note:new': (payload: { coupleId: string; fromUserId: string; emotionKey: MoodKey; content: string }) => void
  'note:read': (payload: { coupleId: string; noteId: string; byUserId: string }) => void
}

export function connectSocket(profile: Profile): Socket<ServerToClientEvents, ClientToServerEvents> {
  const socket = io(profile.serverUrl, {
    transports: ['websocket'],
    autoConnect: true,
  })

  socket.on('connect', () => {
    socket.emit('hello', {
      coupleId: profile.coupleId,
      userId: profile.userId,
      name: profile.myName,
      blobColorKey: profile.blobColorKey,
    })
  })

  return socket
}
