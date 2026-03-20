'use client';

import { useState } from 'react';

interface Props {
  onSubmit: (nickname: string) => void;
}

export default function NicknameModal({ onSubmit }: Props) {
  const [name, setName] = useState('');

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm text-center space-y-4 shadow-[var(--shadow-lg)]">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">참여하기</h2>
        <p className="text-[var(--text-secondary)] text-sm">닉네임을 입력하세요</p>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && name.trim() && onSubmit(name.trim())}
          placeholder="닉네임"
          className="w-full bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-md px-4 py-2.5 text-center text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)] transition"
        />
        <button
          onClick={() => name.trim() && onSubmit(name.trim())}
          disabled={!name.trim()}
          className="w-full bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white py-2.5 rounded-md text-sm font-medium transition disabled:opacity-40"
        >
          입장
        </button>
      </div>
    </div>
  );
}
