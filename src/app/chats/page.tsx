'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'
import Main from '@/components/Main'
import { Chat, Message } from '@/types'


export default function ChatPage() {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser()
      if (data?.user) {
        setUserId(data.user.id)
      }
    }

    fetchUser()
  }, [])

  return (
    <div className="flex h-screen">
      <Sidebar selectedChat={selectedChat} userId={userId} onSelectChat={(chat) => setSelectedChat(chat)} setSelectedChat={setSelectedChat}/>
      <Main selectedChat={selectedChat} userId={userId} />
    </div>
  )
}
