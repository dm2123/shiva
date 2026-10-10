'use client';

import { useState } from 'react';

interface Task {
  id: string;
  dayNumber: number;
  subject: string;
  topic: string;
  description: string;
  isCompleted: boolean;
}

interface Plan {
  id: string;
  targetExam: string;
  targetDate: string;
  title: string;
  createdAt: string;
}

export default function StudyPlanGenerator() {
  const [targetExam, setTargetExam] = useState('JEE');
  const [targetDate, setTargetDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);

  const generatePlan = async () => {
    if (!targetDate) return;

    setLoading(true);
    try {
      const response = await fetch('/api/student/study-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetExam, targetDate })
      });

      const data = await response.json();
      
      await fetchPlans();
      
      if (data.planId) {
        await loadPlan(data.planId);
      }
    } catch (error) {
      console.error('Error generating plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/student/study-plan');
      const data = await response.json();
      setPlans(data.plans || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  const loadPlan = async (planId: string) => {
    try {
      const response = await fetch(`/api/student/study-plan/${planId}`);
      const data = await response.json();
      setCurrentPlan(data.plan);
      setTasks(data.tasks || []);
    } catch (error) {
      console.error('Error loading plan:', error);
    }
  };

  const toggleTask = async (taskId: string, isCompleted: boolean) => {
    if (!currentPlan) return;

    try {
      await fetch(`/api/student/study-plan/${currentPlan.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, isCompleted: !isCompleted })
      });

      setTasks(prev =>
        prev.map(task =>
          task.id === taskId ? { ...task, isCompleted: !isCompleted } : task
        )
      );
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Generate Study Plan</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Target Exam
            </label>
            <select
              value={targetExam}
              onChange={(e) => setTargetExam(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="JEE">JEE</option>
              <option value="NEET">NEET</option>
              <option value="Board">Board Exam</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Target Date
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={generatePlan}
              disabled={loading || !targetDate}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? 'Generating...' : 'Generate Plan'}
            </button>
          </div>
        </div>
      </div>

      {plans.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Your Plans</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => loadPlan(plan.id)}
                className={`p-4 rounded-xl border transition-all text-left ${
                  currentPlan?.id === plan.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                }`}
              >
                <h4 className="font-semibold text-gray-900 dark:text-white">{plan.title}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Target: {new Date(plan.targetDate).toLocaleDateString()}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {currentPlan && tasks.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {currentPlan.title}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`p-4 rounded-xl border transition-all ${
                  task.isCompleted
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                        Day {task.dayNumber}
                      </span>
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                        {task.subject}
                      </span>
                    </div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">{task.topic}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{task.description}</p>
                  </div>
                  <button
                    onClick={() => toggleTask(task.id, task.isCompleted)}
                    className={`ml-4 p-2 rounded-lg transition-colors ${
                      task.isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {task.isCompleted ? '✓' : '○'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}