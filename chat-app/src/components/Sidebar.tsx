'use client'

import {
  MdHome,
  MdList,
  MdCampaign,
  MdOutlineSettings,
  MdChecklist,
} from 'react-icons/md'
import { TbStarsFilled } from "react-icons/tb";
import { AiOutlineWechatWork, AiFillMessage } from "react-icons/ai";
import { RiOrganizationChart, RiContactsBookLine, RiFolderImageFill } from "react-icons/ri";
import { BsCheck, BsCheckAll } from 'react-icons/bs'
import { HiMiniArrowRightOnRectangle } from "react-icons/hi2";
import { FaPhone, FaChartLine } from "react-icons/fa6";
import { IoTicket } from "react-icons/io5";
import Image from 'next/image'
import { useEffect, useState } from 'react'

import { Chat } from '@/types'
import { supabase } from '@/lib/supabase'

import CreateChatModal from '@/components/CreateChatModal'
import FilterBar from '@/components/Filter'

import avatar from '../assets/avatar.png'
import { formatRelativeTime } from '@/utils/dateUtils'

type Props = {
  onSelectChat: (chat: Chat) => void
  selectedChat: Chat | null
  userId: string | null
  setSelectedChat: (chat: Chat) => void 
}

const sidebarItems = [
  { icon: <MdHome size={24} />, label: 'Home' },
  { icon: <AiFillMessage size={24} />, label: 'Chat', active: true },
  { icon: <IoTicket size={24} />, label: 'Tickets' },
  { icon: <FaChartLine size={24} />, label: 'Analytics' },
  { icon: <MdList size={24} />, label: 'Tasks' },
  { icon: <MdCampaign size={24} />, label: 'Announcements' },
  { icon: <RiOrganizationChart size={24} />, label: 'Users' },
  { icon: <RiContactsBookLine size={24} />, label: 'Library' },
  { icon: <RiFolderImageFill size={24} />, label: 'Media' },
  { icon: <MdChecklist size={24} />, label: 'Sync' },
  { icon: <MdOutlineSettings size={24} />, label: 'Settings' },
]

const chatLabelColors = {
  demo: { bg: 'bg-orange-100', text: 'text-orange-700' },
  internal: { bg: 'bg-green-100', text: 'text-green-700' },
};

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
          label,
          messages (
            content,
            created_at,
            sender_id,
            seen,
            sender:users (
              id,
              full_name
            )
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

    const channel = supabase
      .channel('chat-sidebar-sync')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          fetchChats()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])


  return (
    <div className="flex h-screen">
      {/* Icon Sidebar */}
      <aside className="w-16 flex flex-col items-center justify-between bg-white border-r border-gray-200 py-4">
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
          <TbStarsFilled size={24} className="text-gray-500 hover:text-green-500" />
          <HiMiniArrowRightOnRectangle size={24} className="text-gray-500 hover:text-green-500" />
        </div>
      </aside>

      {/* Chat List Sidebar */}
      <div className="relative w-[28%] min-w-[500px] bg-white border-r border-gray-300 flex flex-col">

        {/* Search */}
        <div className="p-4 border-b bg-gray-50 border-gray-300 overflow-x-hidden">
          <FilterBar />
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
                className={`relative flex items-start gap-3 px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-200 ${
                  selectedChat?.id === chat.id ? 'bg-green-50' : ''
                }`}
              >
                {/* Avatar */}
                <Image
                  src={avatarUrl}
                  alt="chat avatar"
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full object-cover mt-1"
                />

                {/* Chat Details */}
                <div className="flex flex-col w-full">
                  <div className="flex justify-between items-center w-full text-sm">
                    <span className="font-medium text-gray-800 truncate">{displayName}</span>

                    <div className="flex flex-wrap gap-1 justify-end">
                      {chat.label &&
                        chat.label.split(',').map((labelStr, index) => {
                          const trimmed = labelStr.trim()
                          const colors =
                            chatLabelColors[trimmed.toLowerCase()] || {
                              bg: 'bg-gray-200',
                              text: 'text-gray-700',
                            }
                          return (
                            <span
                              key={index}
                              className={`text-[10px] px-2 py-0.5 rounded-md uppercase font-semibold tracking-wider ${colors.bg} ${colors.text}`}
                            >
                              {trimmed}
                            </span>
                          )
                        })}
                    </div>
                  </div>

                  {/* Row 2: Sender + Last message + Time */}
                  {chat.messages.length > 0 ? (
                    <div className="flex items-center gap-1 truncate w-[80%]">
                      {chat.messages[chat.messages.length - 1].sender_id === userId && (
                        chat.messages[chat.messages.length - 1].seen ? (
                          <BsCheckAll className="text-blue-500 text-sm" />
                        ) : (
                          <BsCheck className="text-gray-500 text-sm" />
                        )
                      )}
                      <span className="truncate">
                        {chat.messages[chat.messages.length - 1].sender_id === userId
                          ? 'You'
                          : chat.messages[chat.messages.length - 1]?.sender?.full_name || 'Someone'}
                        : {chat.messages[chat.messages.length - 1]?.content}
                      </span>
                      
                    </div>
                  ) : (
                    <span className="text-gray-500 text-sm">No messages yet</span>
                  )}



                  {/* Row 3: Mobile + Others */}
                  <div className="flex justify-between text-sm text-gray-600 mt-0.5">
                    {chat.chat_participants.length > 0 && (
                      <div className="mt-1 flex justify-between items-center">
                        <span
                          className="
                            text-xs text-gray-700 inline-flex items-center rounded-full
                            border border-gray-300 bg-gray-100 px-2 py-0.5 gap-x-1
                          "
                        >
                          <FaPhone className="text-gray-500 text-xs" />
                          {chat.is_group ? (
                            <>
                              {chat.chat_participants[0]?.users?.mobile || 'N/A'}
                              {chat.chat_participants.length > 1 && (
                                <span className="font-bold ml-1">
                                  {`+${chat.chat_participants.length - 1}`}
                                </span>
                              )}
                            </>
                          ) : (
                            mobile
                          )}
                        </span>
                      </div>
                    )}
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {chat.messages.length
                        ? formatRelativeTime(
                            chat.messages[chat.messages.length - 1].created_at
                          )
                        : ''}
                    </span>
                  </div>
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
            <AiOutlineWechatWork className='w-8 h-8'/>
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
