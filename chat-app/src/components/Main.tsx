'use client'

import { BsEmojiSmile } from 'react-icons/bs'
import { IoMdSend, IoMdTime } from 'react-icons/io'
import { HiOutlineSparkles } from 'react-icons/hi'
import { FaPollH } from 'react-icons/fa'
import { ImAttachment } from 'react-icons/im'
import { FaMicrophone } from 'react-icons/fa6'
import { PiClockClockwise } from 'react-icons/pi'
import { BsCheck, BsCheckAll } from 'react-icons/bs'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Chat} from '@/types'
import Image from 'next/image'

import avatar from '../assets/avatar.png';
import whatsappBg from '../assets/bg.png';

import { formatDateLabel } from '@/utils/dateUtils'

type Props = {
  selectedChat: Chat | null
  userId: string | null
}

export default function Main({ selectedChat, userId }: Props) {
  const [messages, setMessages] = useState<any[]>([])
  const [message, setMessage] = useState('')
  const [participants, setParticipants] = useState<any[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)

  const hasScrolledInitially = useRef(false)

  useEffect(() => {

    if (!selectedChat?.id) return

    const markAsSeen = async () => {
      const unseenIds = messages
        .filter(m => m.sender_id !== userId && !m.seen)
        .map(m => m.id)

      if (unseenIds.length) {
        await supabase
          .from('messages')
          .update({ seen: true })
          .in('id', unseenIds)
      }
    }

    markAsSeen()

    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*, sender:users(id, full_name, avatar_url, mobile)')
        .eq('chat_id', selectedChat.id)
        .order('created_at')
      setMessages(data || [])
    }

    const fetchParticipants = async () => {
      const { data } = await supabase
        .from('chat_participants')
        .select('user_id, users(id, full_name, avatar_url, mobile)')
        .eq('chat_id', selectedChat.id)

      const presenceRes = await supabase.from('presence').select('user_id, online')

      const enriched = data?.map((p) => {
        const presence = presenceRes.data?.find((pres) => pres.user_id === p.user_id)
        return { ...p.users, online: presence?.online ?? false }
      })

      setParticipants(enriched || [])
    }

    fetchMessages()
    fetchParticipants()

    const channel = supabase
      .channel(`chat-messages-${selectedChat.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${selectedChat.id}`
        },
        async (payload) => {
          console.log('Realtime payload:', payload)

          const newMessageId = payload.new.id

          const { data: enriched } = await supabase
            .from('messages')
            .select('*, sender:users(id, full_name, avatar_url, mobile)')
            .eq('id', newMessageId)
            .single()

          if (enriched) {
            setMessages((prev) => [...prev, enriched])
            setTimeout(() => {
              bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
            }, 50)
          }
        }
      )
      .subscribe()

      console.log(`Listening to realtime messages for chat ${selectedChat.id}`)
      
    return () => {
      supabase.removeChannel(channel)
    }
    
  }, [selectedChat?.id, messages, userId])

  useEffect(() => {
    if (!hasScrolledInitially.current && messages.length > 0) {
      hasScrolledInitially.current = true
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 50)
    }
}, [messages])


  const sendMessage = async () => {
    if (!message.trim() || !userId || !selectedChat) return
    await supabase.from('messages').insert([
      {
        content: message,
        sender_id: userId,
        chat_id: selectedChat.id,
      },
    ])
    setMessage('')
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const groupedMessages: Record<string, typeof messages> = messages.reduce((acc, msg) => {
    const dateKey = new Date(msg.created_at).toDateString()
    if (!acc[dateKey]) acc[dateKey] = []
    acc[dateKey].push(msg)
    return acc
  }, {} as Record<string, typeof messages>)


  return (
    <main className="flex-1 flex flex-col bg-[#ece5dd]" style={{ backgroundImage: `url(${whatsappBg.src})` }}>
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 bg-white border-b border-gray-300">
        <div className="flex items-center gap-4">
          <Image
            src={
              selectedChat?.is_group
                ? selectedChat.avatar_url || avatar
                : participants.find(p => p.id !== userId)?.avatar_url || avatar
            }
            alt="Chat Avatar"
            width={40}
            height={40}
            className="w-10 h-10 rounded-full object-cover"
          />
          
          <div className="flex flex-col">
            {selectedChat?.is_group ? (
              <>
                <h1 className="text-lg font-semibold text-gray-800">
                  {selectedChat?.name || 'Group'}
                </h1>
                <span className="text-xs text-gray-500">
                  {participants.map((p) => p.full_name).join(', ')}
                </span>
              </>
            ) : (
              <>
                <h1 className="text-lg font-semibold text-gray-800">
                  {participants.find(p => p.id !== userId)?.full_name || 'Chat'}
                </h1>
              </>
            )}
          </div>
        </div>

        <div className="flex -space-x-3 pr-2">
          {participants.map((user) => (
            <div key={user.id} className="relative w-8 h-8 rounded-full">
              <Image
                src={user.avatar_url || avatar}
                className="w-full h-full rounded-full object-cover border-2 border-white"
                alt={user.full_name}
                width={32}
                height={32}
              />
              <span
                className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                  user.online ? 'bg-green-500' : 'bg-gray-400'
                }`}
              />
            </div>
          ))}
        </div>
      </div>

     {/* Messages */}
      <div className="flex-1 px-6 py-4 overflow-y-auto">
        <div className="flex flex-col gap-3">
          {Object.entries(groupedMessages).map(([date, msgs]) => (
            <div key={date}>
              <div className="flex justify-center my-4">
                <span className="bg-[#e1f3fb] text-gray-700 text-xs px-4 py-1 rounded-full shadow-sm">
                  {formatDateLabel(date)}
                </span>
              </div>

              {msgs.map((msg) => {
                const isMe = msg.sender_id === userId
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'} items-end gap-2 py-1`}
                  >
                    {!isMe && (
                      <Image
                        src={msg.sender?.avatar_url || avatar}
                        alt={msg.sender?.full_name}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    )}
                    <div className={`max-w-xs p-3 rounded-md shadow-sm ${isMe ? 'bg-green-100' : 'bg-white'}`}>
                      <div className="text-xs text-gray-600 font-medium">
                        {msg.sender?.full_name || 'Unknown'} • {msg.sender?.mobile || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-800">{msg.content}</div>
                      <div className="flex justify-end mt-1 text-gray-500 text-xs gap-1 pr-1 items-center">
                        <span className="text-[11px]">
                          {new Date(msg.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {isMe && (
                          msg.seen ? (
                            <BsCheckAll className="text-[15px] text-blue-500" />
                          ) : (
                            <BsCheck className="text-[15px]" />
                          )
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-white px-4 py-2 border-t border-gray-300">
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 py-2 px-4 outline-none text-md"
          />
          <button onClick={sendMessage} className="text-green-600 text-2xl">
            <IoMdSend />
          </button>
        </div>
        <div className="flex items-center m-3 text-gray-500 text-xl gap-6">
          <ImAttachment />
          <BsEmojiSmile />
          <IoMdTime />
          <PiClockClockwise />
          <HiOutlineSparkles />
          <FaPollH />
          <FaMicrophone />
        </div>
      </div>
    </main>
  )
}
