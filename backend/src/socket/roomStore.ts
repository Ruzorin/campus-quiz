interface GameRoom {
  id: string; // class_id
  hostId: number;
  setId?: number;
  players: {
    id: number;
    username: string;
    score: number;
    progress: number;
  }[];
  status: 'waiting' | 'playing' | 'finished';
  currentQuestionIndex: number;
}

export const rooms: Record<string, GameRoom> = {};
