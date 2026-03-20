'use client';

import { useState } from 'react';

interface Props {
  onSubmit: (nickname: string) => void;
}

export default function NicknameModal({ onSubmit }: Props) {
  const [name, setName] = useState('');

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl p-6 w-full max-w-sm text-center space-y-4">
        <h2 className="text-xl font-bold">참여하기</h2>
        <p className="text-gray-400 text-sm">닉네임을 입력하세요</p>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && name.trim() && onSubmit(name.trim())}
          placeholder="닉네임"
          className="w-full bg-gray-800 rounded-lg px-4 py-3 text-center outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={() => name.trim() && onSubmit(name.trim())}
          disabled={!name.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-medium transition disabled:opacity-50"
        >
          입장
        </button>
      </div>
    </div>
  );
}
