'use client'

import {
  MdHome,
  MdChat,
  MdConfirmationNumber,
  MdBarChart,
  MdList,
  MdCampaign,
  MdOutlineSettings,
  MdOutlineVideoLibrary,
  MdPhoto,
  MdCompareArrows,
  MdStarOutline,
  MdOutlineStar,
} from 'react-icons/md'
import { FaUserCircle } from 'react-icons/fa'
import { BsPeopleFill, BsThreeDotsVertical, BsSearch } from 'react-icons/bs'
import { IoMdBook } from 'react-icons/io'
import Image from 'next/image'
import { useEffect, useState } from 'react'

import { Chat } from '@/types'
import { supabase } from '@/lib/supabase'
import CreateChatModal from '@/components/CreateChatModal'

import avatar from '../assets/avatar.png'

type Props = {
  onSelectChat: (chat: Chat) => void
  selectedChat: Chat | null
  userId: string | null
  setSelectedChat: (chat: Chat) => void 
}

const sidebarItems = [
  { icon: <MdHome size={24} />, label: 'Home' },
  { icon: <MdChat size={24} />, label: 'Chat', active: true },
  { icon: <MdConfirmationNumber size={24} />, label: 'Tickets' },
  { icon: <MdBarChart size={24} />, label: 'Analytics' },
  { icon: <MdList size={24} />, label: 'Tasks' },
  { icon: <MdCampaign size={24} />, label: 'Announcements' },
  { icon: <BsPeopleFill size={24} />, label: 'Users' },
  { icon: <IoMdBook size={24} />, label: 'Library' },
  { icon: <MdPhoto size={24} />, label: 'Media' },
  { icon: <MdCompareArrows size={24} />, label: 'Sync' },
  { icon: <MdOutlineSettings size={24} />, label: 'Settings' },
  { icon: <MdOutlineStar size={24} />, label: 'Favorites' },
  { icon: <MdStarOutline size={24} />, label: 'Starred' },
]

export default function Sidebar({
  onSelectChat,
  selectedChat,
  userId,
  setSelectedChat,
}: Props) {
  const [activeIndex, setActiveIndex] = useState(1)
  const [chats, setChats] = useState<Chat[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)

  const fetchChats = async () => {
    if (!userId) return
    const { data, error } = await supabase
      .from('chat_participants')
      .select(`
        chat_id,
        chats (
          id,
          name,
          is_group,
          avatar_url,
          messages (
            content,
            created_at
          ),
          chat_participants (
            user_id,
            users (
              id,
              full_name,
              avatar_url,
              mobile
            )
          )
        )
      `)
      .eq('user_id', userId)

    if (data) {
      console.log('Fetched chats:', data)
      const mapped = data.map((row: any) => row.chats)
      setChats(mapped)
    }
  }

  useEffect(() => {
    fetchChats()
  }, [userId])

  return (
    <div className="flex h-screen">
      {/* Icon Sidebar */}
      <aside className="w-16 flex flex-col items-center justify-between bg-white border-r py-4">
        <div className="mb-6">
          <Image src={avatar} alt="Logo" width={32} height={32} className="rounded-full" />
        </div>
        <div className="flex flex-col gap-4 flex-1 items-center">
          {sidebarItems.map((item, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`p-2 rounded-md hover:bg-gray-100 ${
                index === activeIndex ? 'bg-green-100 text-green-600' : 'text-gray-500'
              }`}
              title={item.label}
            >
              {item.icon}
            </button>
          ))}
        </div>
        <div className="mt-auto">
          <MdOutlineVideoLibrary size={24} className="text-gray-500 hover:text-green-500" />
        </div>
      </aside>

      {/* Chat List Sidebar */}
      <div className="relative w-[28%] min-w-[500px] bg-white border-r border-gray-300 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-300">
          <FaUserCircle className="text-3xl text-gray-600" />
          <BsThreeDotsVertical className="text-xl text-gray-600" />
        </div>

        {/* Search */}
        <div className="px-4 py-2 border-b border-gray-300">
          <div className="flex items-center bg-gray-100 px-3 py-2 rounded-md">
            <BsSearch className="text-gray-500 mr-2" />
            <input
              className="bg-transparent w-full outline-none text-sm"
              type="text"
              placeholder="Search or start new chat"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="overflow-y-auto flex-1">
          {chats.map((chat: any) => {
            if (!chat || !chat.chat_participants?.length) return null
            if (!chat.messages) chat.messages = []

            const otherParticipant = !chat.is_group
              ? chat.chat_participants
                  .map((cp: any) => cp.users)
                  .find((user: any) => user?.id !== userId)
              : null

            const displayName = chat.is_group
              ? chat.name
              : otherParticipant?.full_name || 'Unknown'

            const avatarUrl = chat.is_group
              ? chat.avatar_url || avatar
              : otherParticipant?.avatar_url || avatar

            const mobile = !chat.is_group ? otherParticipant?.mobile : null

            const lastMessage = chat.messages.length
              ? chat.messages[chat.messages.length - 1].content
              : 'No messages yet'

            const lastMessageTime = chat.messages.length
              ? new Date(chat.messages[chat.messages.length - 1].created_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : ''

            return (
              <div
                key={chat.id}
                onClick={() => onSelectChat(chat)}
                className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-200 ${
                  selectedChat?.id === chat.id ? 'bg-green-50' : ''
                }`}
              >
                <Image
                  src={avatarUrl}
                  alt="chat avatar"
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex flex-col w-full">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium">{displayName}</span>
                    <span className="text-xs text-gray-500">{lastMessageTime}</span>
                  </div>
                  <span className="text-sm text-gray-500 truncate">{lastMessage}</span>
                  {mobile && (
                    <span className="text-xs text-gray-400 truncate">{mobile}</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Floating + Button */}
        <div className="absolute bottom-4 right-4">
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-md hover:bg-green-700 transition"
            title="New Chat"
          >
            +
          </button>
        </div>

        {/* Create Chat Modal */}
        {showCreateModal && userId && (
          <CreateChatModal
            userId={userId}
            onClose={() => setShowCreateModal(false)}
            onChatCreated={(chat) => {
              setSelectedChat(chat)
              setShowCreateModal(false)
              fetchChats() // Refresh chat list after creating a new chat
            }}
          />
        )}
      </div>
    </div>
  )
}
