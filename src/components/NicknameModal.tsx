'use client';

import { useState } from 'react';

interface Props {
  initialNickname?: string;
  onSubmit: (nickname: string) => void;
}

export default function NicknameModal({ initialNickname, onSubmit }: Props) {
  const [name, setName] = useState(initialNickname || '');

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm text-center space-y-4 shadow-lg">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">참여하기</h2>
        <p className="text-[var(--text-secondary)] text-sm">닉네임을 입력하세요</p>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && name.trim() && onSubmit(name.trim())}
          placeholder="닉네임"
          className="w-full bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-md px-4 py-3 text-center outline-none focus:ring-2 focus:ring-[var(--accent-primary)] text-[var(--text-primary)]"
        />
        <button
          onClick={() => name.trim() && onSubmit(name.trim())}
          disabled={!name.trim()}
          className="w-full bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white py-3 rounded-md font-medium transition disabled:opacity-50"
        >
          입장
        </button>
      </div>
    </div>
  );
}
