export type Chat = {
  id: string
  name: string
  created_at: string
  avatar_url?: string;
  is_group: boolean; 
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
