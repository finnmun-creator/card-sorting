'use client';

import { useState } from 'react';

interface Props {
  initialNickname?: string;
  existingParticipants?: string[];
  onSubmit: (nickname: string) => void;
}

export default function NicknameModal({ initialNickname, existingParticipants = [], onSubmit }: Props) {
  const [name, setName] = useState(initialNickname || '');

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm text-center space-y-4 shadow-lg">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">참여하기</h2>

        {existingParticipants.length > 0 && (
          <div className="space-y-2">
            <p className="text-[var(--text-secondary)] text-xs">기존 참여자로 입장</p>
            <div className="flex flex-wrap justify-center gap-2">
              {existingParticipants.map((p) => (
                <button
                  key={p}
                  onClick={() => setName(p)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition ${
                    name === p
                      ? 'border-[var(--accent-primary)] bg-blue-50 text-[var(--accent-primary)] font-medium'
                      : 'border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 pt-1">
              <div className="flex-1 h-px bg-[var(--border-default)]" />
              <span className="text-[var(--text-tertiary)] text-xs">또는 새 닉네임</span>
              <div className="flex-1 h-px bg-[var(--border-default)]" />
            </div>
          </div>
        )}

        {existingParticipants.length === 0 && (
          <p className="text-[var(--text-secondary)] text-sm">닉네임을 입력하세요</p>
        )}

        <input
          autoFocus={existingParticipants.length === 0}
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
