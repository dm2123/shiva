'use client';

import { useState, useEffect } from 'react';

import StudyGroupCard from '@/components/study-groups/StudyGroupCard';
import StudyGroupChat from '@/components/study-groups/StudyGroupChat';

interface StudyGroup {
  id: number;
  name: string;
  memberCount: number;
  maxMembers: number;
  isPrivate: number;
  creatorName?: string;
  courseTitle?: string;
}

export default function StudyGroupsPage() {
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newMaxMembers, setNewMaxMembers] = useState(10);
  const [newIsPrivate, setNewIsPrivate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [joiningId, setJoiningId] = useState<number | null>(null);

  const fetchGroups = async () => {
    try {
      const res = await fetch('/api/student/study-groups');
      const data = await res.json();
      setGroups(data.groups || []);
    } catch (error) {
      console.error('Failed to fetch groups:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleJoin = async (groupId: number) => {
    setJoiningId(groupId);
    try {
      const res = await fetch(`/api/student/study-groups/${groupId}/join`, { method: 'POST' });
      if (res.ok) {
        fetchGroups();
        setSelectedGroupId(String(groupId));
      }
    } catch (error) {
      console.error('Failed to join group:', error);
    } finally {
      setJoiningId(null);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch('/api/student/study-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          maxMembers: newMaxMembers,
          isPrivate: newIsPrivate,
        }),
      });

      if (res.ok) {
        setShowCreate(false);
        setNewName('');
        setNewMaxMembers(10);
        setNewIsPrivate(false);
        fetchGroups();
      }
    } catch (error) {
      console.error('Failed to create group:', error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Study Groups</h1>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          {showCreate ? 'Cancel' : 'Create Group'}
        </button>
      </div>

      {showCreate && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold mb-4">New Study Group</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <input
              type="text"
              placeholder="Group Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
            <div className="flex gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Max Members</label>
                <input
                  type="number"
                  value={newMaxMembers}
                  onChange={(e) => setNewMaxMembers(parseInt(e.target.value) || 10)}
                  min={2}
                  max={100}
                  className="border rounded-lg px-4 py-2 w-24 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newIsPrivate}
                    onChange={(e) => setNewIsPrivate(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">Private Group</span>
                </label>
              </div>
            </div>
            <button
              type="submit"
              disabled={creating}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {creating ? 'Creating...' : 'Create'}
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {loading ? (
            <p className="text-gray-500">Loading groups...</p>
          ) : groups.length === 0 ? (
            <p className="text-gray-500">No study groups available. Create one!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groups.map((group) => (
                <div key={group.id} onClick={() => setSelectedGroupId(String(group.id))} className="cursor-pointer">
                  <StudyGroupCard
                    group={group}
                    onJoin={handleJoin}
                    joining={joiningId === group.id}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          {selectedGroupId ? (
            <StudyGroupChat groupId={selectedGroupId} />
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 text-center text-gray-400">
              Select a group to view chat
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
