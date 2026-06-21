import { useState } from 'react';
import { Plus, Calendar, Filter } from 'lucide-react';
import { WeeklyPlanCard } from '../components/WeeklyPlanCard';
import { WeeklyPlanForm } from '../components/WeeklyPlanForm';
import { useStore } from '../store/useStore';
import type { WeeklyPlan } from '../types';

export const WeeklyPlanner = () => {
  const { weeklyPlans, deleteWeeklyPlan, getCurrentWeekPlan } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editPlan, setEditPlan] = useState<WeeklyPlan | undefined>();
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'failed'>('all');

  const filteredPlans = weeklyPlans
    .filter((plan) => {
      if (statusFilter !== 'all' && plan.status !== statusFilter) return false;
      return true;
    })
    .sort((a, b) => new Date(b.weekStartDate).getTime() - new Date(a.weekStartDate).getTime());

  const currentPlan = getCurrentWeekPlan();

  const handleEdit = (plan: WeeklyPlan) => {
    setEditPlan(plan);
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
    setEditPlan(undefined);
  };

  const statusCounts = {
    all: weeklyPlans.length,
    active: weeklyPlans.filter((p) => p.status === 'active').length,
    completed: weeklyPlans.filter((p) => p.status === 'completed').length,
    failed: weeklyPlans.filter((p) => p.status === 'failed').length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">周计划管理</h1>
          <p className="text-gray-500">规划和追踪你的每周学习目标</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-5 h-5" />
          创建周计划
        </button>
      </div>

      {currentPlan && (
        <div className="card bg-gradient-to-br from-primary-50 via-white to-secondary-50 border-primary-200">
          <div className="flex items-center gap-2 mb-3">
            <span className="tag tag-primary">本周计划</span>
          </div>
          <WeeklyPlanCard
            plan={currentPlan}
            compact
            onEdit={handleEdit}
            onDelete={deleteWeeklyPlan}
          />
        </div>
      )}

      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
        <Filter className="w-5 h-5 text-gray-400 flex-shrink-0" />
        {(['all', 'active', 'completed', 'failed'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              statusFilter === status
                ? 'bg-primary-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {status === 'all'
              ? '全部'
              : status === 'active'
              ? '进行中'
              : status === 'completed'
              ? '已完成'
              : '未达成'}
            <span className="ml-1 opacity-70">({statusCounts[status]})</span>
          </button>
        ))}
      </div>

      {filteredPlans.length === 0 ? (
        <div className="card text-center py-12">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">暂无周计划</h3>
          <p className="text-gray-400 mb-4">创建你的第一个学习周计划吧</p>
          <button
            onClick={() => setShowForm(true)}
            className="btn btn-primary btn-sm inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            创建计划
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filteredPlans.map((plan) => (
            <WeeklyPlanCard
              key={plan.id}
              plan={plan}
              onEdit={handleEdit}
              onDelete={deleteWeeklyPlan}
            />
          ))}
        </div>
      )}

      {showForm && <WeeklyPlanForm onClose={handleClose} editPlan={editPlan} />}
    </div>
  );
};
