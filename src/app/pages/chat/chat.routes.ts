export const CHAT_ROUTES = {
  root: 'chat',
  detail: (id: string): string => `chat/${id}`,
} as const;
