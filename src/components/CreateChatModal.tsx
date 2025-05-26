'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'

type Props = {
  userId: string
  onClose: () => void
  onChatCreated: (chat: any) => void
}

export default function CreateChatModal({ userId, onClose, onChatCreated }: Props) {
  const [users, setUsers] = useState<any[]>([])
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [groupName, setGroupName] = useState('')
  const [groupAvatar, setGroupAvatar] = useState('')
  const [isGroup, setIsGroup] = useState(false)

  useEffect(() => {
    const loadUsers = async () => {
      const { data } = await supabase
        .from('users')
        .select('id, full_name, avatar_url')
        .neq('id', userId)
      setUsers(data || [])
    }
    loadUsers()
  }, [userId])

  const handleToggle = (id: string) => {
    if (!isGroup) {
      setSelectedUsers([id]) // Only one allowed for 1-on-1
    } else {
      setSelectedUsers((prev) =>
        prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
      )
    }
  }

  const handleCreate = async () => {
    if (selectedUsers.length === 0) return

    const allUserIds = [...selectedUsers, userId]

    const { data, error } = await supabase
      .from('chats')
      .insert([
        {
          name: isGroup ? groupName : null,
          avatar_url: isGroup ? groupAvatar : null,
          is_group: isGroup,
          creator_id: userId,
        },
      ])
      .select()

    if (!data || error) {
      console.error('Failed to create chat:', error)
      return
    }

    const chatId = data[0].id

    const { error: participantsError } = await supabase
      .from('chat_participants')
      .insert(
        allUserIds.map((uid) => ({
          chat_id: chatId,
          user_id: uid,
        }))
      )

    if (participantsError) {
      console.error('Failed to add participants:', participantsError)
      return
    }

    // Fetch full chat with participants and messages
    const { data: fullChat } = await supabase
      .from('chats')
      .select(`
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
      `)
      .eq('id', chatId)
      .single()

    if (!fullChat) {
      console.error('Failed to fetch full chat info')
      return
    }

    onClose()
    onChatCreated(fullChat) // 
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <h2 className="text-lg font-semibold mb-4">Start New Chat</h2>

        {/* Chat Type Selector */}
        <div className="mb-3">
          <label className="text-sm font-medium">Chat Type</label>
          <select
            className="mt-1 border w-full rounded p-2"
            value={isGroup ? 'group' : 'direct'}
            onChange={(e) => {
              setIsGroup(e.target.value === 'group')
              setSelectedUsers([]) // Reset on switch
            }}
          >
            <option value="direct">1-on-1 Chat</option>
            <option value="group">Group Chat</option>
          </select>
        </div>

        {/* Group Name & Avatar */}
        {isGroup && (
          <>
            <input
              type="text"
              placeholder="Group Name"
              className="w-full border rounded p-2 mb-2"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Group Avatar URL"
              className="w-full border rounded p-2 mb-3"
              value={groupAvatar}
              onChange={(e) => setGroupAvatar(e.target.value)}
            />
          </>
        )}

        {/* Select Users */}
        <div className="mb-4 max-h-40 overflow-y-auto space-y-2 border rounded p-2">
          {users.map((user) => (
            <div key={user.id} className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedUsers.includes(user.id)}
                onChange={() => handleToggle(user.id)}
                disabled={!isGroup && selectedUsers.length === 1 && !selectedUsers.includes(user.id)}
              />
              <Image
                src={user.avatar_url || '/default-avatar.png'}
                alt={user.full_name}
                width={24}
                height={24}
                className="w-6 h-6 rounded-full object-cover"
              />
              <span className="text-sm">{user.full_name}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="text-gray-500 hover:text-black">
            Cancel
          </button>
          <button
            onClick={handleCreate}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  )
}
