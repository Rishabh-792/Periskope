export type Chat = {
  id: string
  name: string
  created_at: string
}

export type Message = {
  id: string
  chat_id: string
  sender_id: string
  content: string
  created_at: string
}

export type User = {
  id: string
  full_name: string
  email: string
}
