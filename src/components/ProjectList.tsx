'use client';

import { useEffect, useState } from 'react';
import { getProjects, createProject, deleteProject, createSession, getSessionsByProject } from '@/lib/db';
import type { Project } from '@/types';
import { useRouter } from 'next/navigation';

export default function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    try {
      const data = await getProjects();
      setProjects(data);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!newTitle.trim()) return;
    const project = await createProject(newTitle.trim());
    const session = await createSession(project.id);
    router.push(`/board/${session.share_code}`);
  }

  async function handleDelete(id: string) {
    await deleteProject(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }

  async function handleOpen(projectId: string) {
    const sessions = await getSessionsByProject(projectId);
    if (sessions.length > 0) {
      router.push(`/board/${sessions[0].share_code}`);
    } else {
      const session = await createSession(projectId);
      router.push(`/board/${session.share_code}`);
    }
  }

  if (loading) return <div className="text-center py-20 text-[var(--text-tertiary)]">로딩 중...</div>;

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Card Sorting</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white px-4 py-2 rounded-md text-sm font-medium transition"
        >
          + 새로 만들기
        </button>
      </div>

      {showCreate && (
        <div className="mb-6 bg-white border border-[var(--border-default)] p-4 rounded-md flex gap-2 shadow-[var(--shadow-sm)]">
          <input
            autoFocus
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            placeholder="프로젝트 이름을 입력하세요"
            className="flex-1 bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-md px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)] transition"
          />
          <button
            onClick={handleCreate}
            className="bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white px-4 py-2 rounded-md text-sm font-medium transition"
          >
            생성
          </button>
          <button
            onClick={() => { setShowCreate(false); setNewTitle(''); }}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-2 text-sm transition"
          >
            취소
          </button>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="text-center py-20 text-[var(--text-tertiary)] text-sm">
          아직 프로젝트가 없습니다. 새로 만들어보세요!
        </div>
      ) : (
        <div className="space-y-2">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white border border-[var(--border-default)] rounded-md p-4 flex items-center justify-between hover:border-[var(--border-hover)] hover:shadow-[var(--shadow-sm)] transition cursor-pointer"
              onClick={() => handleOpen(project.id)}
            >
              <div>
                <h2 className="font-medium text-[var(--text-primary)]">{project.title}</h2>
                <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                  {new Date(project.created_at).toLocaleDateString('ko-KR')}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(project.id);
                }}
                className="text-[var(--text-tertiary)] hover:text-red-400 transition text-sm"
              >
                삭제
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
