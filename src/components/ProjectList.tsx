'use client';

import { useEffect, useState } from 'react';
import { getProjects, createProject, deleteProject, updateProject, createSession, getSessionsByProject } from '@/lib/db';
import type { Project } from '@/types';
import { useRouter } from 'next/navigation';

export default function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
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
    const project = await createProject(newTitle.trim(), newDesc.trim());
    const session = await createSession(project.id);
    router.push(`/board/${session.share_code}`);
  }

  async function handleDelete(id: string) {
    await deleteProject(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }

  function startEdit(project: Project, e: React.MouseEvent) {
    e.stopPropagation();
    setEditingId(project.id);
    setEditTitle(project.title);
    setEditDesc(project.description || '');
  }

  async function handleSaveEdit(e?: React.MouseEvent) {
    if (e) e.stopPropagation();
    if (!editingId || !editTitle.trim()) return;
    await updateProject(editingId, { title: editTitle.trim(), description: editDesc.trim() });
    setProjects((prev) => prev.map((p) => p.id === editingId ? { ...p, title: editTitle.trim(), description: editDesc.trim() } : p));
    setEditingId(null);
  }

  function cancelEdit(e?: React.MouseEvent) {
    if (e) e.stopPropagation();
    setEditingId(null);
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
        <h1 className="flex items-center gap-2.5 text-2xl font-semibold text-[var(--text-primary)]">
          <img src="/icon.svg" alt="" className="w-8 h-8 rounded-md" />
          Card Sorting
        </h1>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white px-4 py-2 rounded-md text-sm font-medium transition"
        >
          + 새로 만들기
        </button>
      </div>

      {showCreate && (
        <div className="mb-6 bg-white border border-[var(--border-default)] p-4 rounded-lg space-y-3">
          <input
            autoFocus
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            placeholder="프로젝트 이름"
            className="w-full bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-md px-3 py-2 text-sm outline-none focus:border-[var(--accent-primary)]"
          />
          <input
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="프로젝트 목적 (선택)"
            className="w-full bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-md px-3 py-2 text-sm outline-none focus:border-[var(--accent-primary)]"
          />
          <div className="flex justify-end gap-2">
            <button onClick={() => { setShowCreate(false); setNewTitle(''); setNewDesc(''); }} className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] h-9 px-3">
              취소
            </button>
            <button onClick={handleCreate} className="bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white h-9 px-4 rounded-md text-sm font-medium">
              생성
            </button>
          </div>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="text-center py-20 text-[var(--text-tertiary)] text-sm">
          아직 프로젝트가 없습니다. 새로 만들어보세요!
        </div>
      ) : (
        <div className="space-y-2">
          {projects.map((project) =>
            editingId === project.id ? (
              <div
                key={project.id}
                className="bg-white border border-[var(--accent-primary)] rounded-lg p-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="space-y-2">
                  <input
                    autoFocus
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSaveEdit(); if (e.key === 'Escape') cancelEdit(); }}
                    placeholder="프로젝트 이름"
                    className="w-full bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-md px-3 py-2 text-sm outline-none focus:border-[var(--accent-primary)] font-semibold"
                  />
                  <input
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSaveEdit(); if (e.key === 'Escape') cancelEdit(); }}
                    placeholder="프로젝트 목적 (선택)"
                    className="w-full bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-md px-3 py-2 text-sm outline-none focus:border-[var(--accent-primary)]"
                  />
                  <div className="flex justify-end gap-2 pt-1">
                    <button onClick={cancelEdit} className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] h-8 px-3">취소</button>
                    <button onClick={handleSaveEdit} className="bg-[var(--accent-primary)] text-white text-sm h-8 px-4 rounded-md font-medium">저장</button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                key={project.id}
                className="bg-white border border-[var(--border-default)] rounded-lg p-4 hover:border-[var(--border-hover)] transition cursor-pointer"
                onClick={() => handleOpen(project.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-[var(--text-primary)]">{project.title}</h2>
                    {project.description && (
                      <p className="text-sm text-[var(--text-secondary)] mt-0.5 truncate">{project.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-[var(--text-tertiary)]">
                        {new Date(project.created_at).toLocaleDateString('ko-KR')}
                      </span>
                      {project.participants && project.participants.length > 0 && (
                        <div className="flex items-center gap-1">
                          <div className="flex -space-x-1.5">
                            {project.participants.slice(0, 3).map((name, i) => (
                              <div
                                key={i}
                                className="w-5 h-5 rounded-full bg-[var(--accent-primary)] text-white text-[8px] font-medium flex items-center justify-center border border-white"
                                title={name}
                              >
                                {name.charAt(0).toUpperCase()}
                              </div>
                            ))}
                            {project.participants.length > 3 && (
                              <div className="w-5 h-5 rounded-full bg-[var(--bg-muted)] text-[var(--text-secondary)] text-[8px] flex items-center justify-center border border-white">
                                +{project.participants.length - 3}
                              </div>
                            )}
                          </div>
                          <span className="text-xs text-[var(--text-tertiary)]">{project.participants.length}명</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={(e) => startEdit(project, e)}
                      className="text-[var(--text-tertiary)] hover:text-[var(--accent-primary)] transition text-xs"
                    >
                      편집
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(project.id);
                      }}
                      className="text-[var(--text-tertiary)] hover:text-red-400 transition text-xs"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
