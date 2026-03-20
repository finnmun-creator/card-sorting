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

  if (loading) return <div className="text-center py-20 text-gray-400">로딩 중...</div>;

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Card Sorting</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition"
        >
          + 새로 만들기
        </button>
      </div>

      {showCreate && (
        <div className="mb-6 bg-gray-900 p-4 rounded-lg flex gap-2">
          <input
            autoFocus
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            placeholder="프로젝트 이름을 입력하세요"
            className="flex-1 bg-gray-800 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-medium">
            생성
          </button>
          <button onClick={() => { setShowCreate(false); setNewTitle(''); }} className="text-gray-400 hover:text-white px-2">
            취소
          </button>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          아직 프로젝트가 없습니다. 새로 만들어보세요!
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-gray-900 rounded-lg p-4 flex items-center justify-between hover:bg-gray-800 transition cursor-pointer"
              onClick={() => handleOpen(project.id)}
            >
              <div>
                <h2 className="font-semibold text-lg">{project.title}</h2>
                <p className="text-sm text-gray-400">
                  {new Date(project.created_at).toLocaleDateString('ko-KR')}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(project.id);
                }}
                className="text-gray-500 hover:text-red-400 transition text-sm"
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
