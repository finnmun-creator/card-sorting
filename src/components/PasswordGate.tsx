'use client';

import { useState } from 'react';

interface Props {
  onSuccess: () => void;
  checkPassword: (password: string) => boolean;
}

export default function PasswordGate({ onSuccess, checkPassword }: Props) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  function handleSubmit() {
    if (checkPassword(password)) {
      onSuccess();
    } else {
      setError(true);
      setTimeout(() => setError(false), 1500);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm text-center space-y-4 shadow-lg">
        <div className="flex justify-center">
          <svg className="w-12 h-12 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-[var(--text-primary)]">잠긴 프로젝트</h2>
        <p className="text-[var(--text-secondary)] text-sm">비밀번호를 입력하세요</p>
        <input
          autoFocus
          type="password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(false); }}
          onKeyDown={(e) => e.key === 'Enter' && password.trim() && handleSubmit()}
          placeholder="비밀번호"
          className={`w-full bg-[var(--bg-canvas)] border rounded-md px-4 py-3 text-center outline-none focus:ring-2 text-[var(--text-primary)] ${
            error
              ? 'border-red-400 focus:ring-red-300 animate-shake'
              : 'border-[var(--border-default)] focus:ring-[var(--accent-primary)]'
          }`}
        />
        {error && (
          <p className="text-red-400 text-sm">비밀번호가 틀렸습니다</p>
        )}
        <button
          onClick={() => password.trim() && handleSubmit()}
          disabled={!password.trim()}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-md font-medium transition disabled:opacity-50"
        >
          확인
        </button>
      </div>
    </div>
  );
}
