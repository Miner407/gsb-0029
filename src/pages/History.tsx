import { useState, useMemo } from 'react';
import {
  Clock,
  XCircle,
  Edit3,
  Filter,
  Download,
  Calendar,
  Tag,
  Search,
  ChevronDown,
  X,
  RefreshCw,
  BookOpen,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import {
  formatDateTime,
  formatDuration,
  getTodayStr,
} from '../utils/dateUtils';
import {
  filterSessionsByOptions,
  generateMarkdownReport,
  getAllTags,
} from '../utils/statistics';
import type { PomodoroSession, HistoryFilterOptions } from '../types';

export const History = () => {
  const { sessions, tasks, weeklyPlans, deleteSession, updateSession } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<HistoryFilterOptions['status']>('all');
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [planFilter, setPlanFilter] = useState<string | undefined>();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [editingSession, setEditingSession] = useState<PomodoroSession | null>(null);
  const [editSummary, setEditSummary] = useState('');
  const [editReviewNote, setEditReviewNote] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const allTags = getAllTags(tasks);

  const filteredSessions = useMemo(
    () => {
      const filterOptions: HistoryFilterOptions = {
        status: statusFilter,
        tags: tagFilter,
        weeklyPlanId: planFilter,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        searchQuery: searchQuery || undefined,
      };
      return filterSessionsByOptions(sessions, tasks, filterOptions);
    },
    [sessions, tasks, statusFilter, tagFilter, planFilter, startDate, endDate, searchQuery]
  );

  const groupedSessions = useMemo(() => {
    const groups: Record<string, PomodoroSession[]> = {};
    filteredSessions.forEach((session) => {
      const date = session.startTime.slice(0, 10);
      if (!groups[date]) groups[date] = [];
      groups[date].push(session);
    });
    return groups;
  }, [filteredSessions]);

  const activeFilterCount =
    (statusFilter !== 'all' ? 1 : 0) +
    tagFilter.length +
    (planFilter ? 1 : 0) +
    (startDate ? 1 : 0) +
    (endDate ? 1 : 0) +
    (searchQuery ? 1 : 0);

  const resetFilters = () => {
    setStatusFilter('all');
    setTagFilter([]);
    setPlanFilter(undefined);
    setStartDate('');
    setEndDate('');
    setSearchQuery('');
  };

  const handleExportMarkdown = () => {
    const markdown = generateMarkdownReport(
      filteredSessions,
      tasks,
      weeklyPlans,
      `番茄记录筛选导出 - ${getTodayStr()}`
    );
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pomodoro-export-${getTodayStr()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const toggleTag = (tag: string) => {
    setTagFilter((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSaveEdit = () => {
    if (editingSession) {
      updateSession(editingSession.id, {
        summary: editSummary,
        reviewNote: editReviewNote,
      });
      setEditingSession(null);
    }
  };

  const statusConfig = {
    completed: {
      label: '已完成',
      icon: Clock,
      class: 'bg-success-100 text-success-700 border-success-200',
    },
    abandoned: {
      label: '已放弃',
      icon: XCircle,
      class: 'bg-danger-100 text-danger-700 border-danger-200',
    },
    manual: {
      label: '手动记录',
      icon: Edit3,
      class: 'bg-secondary-100 text-secondary-700 border-secondary-200',
    },
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">历史记录</h1>
          <p className="text-gray-500 text-sm">
            共 {filteredSessions.length} 条记录
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleExportMarkdown}
            disabled={filteredSessions.length === 0}
            className="btn btn-primary btn-sm flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            导出 Markdown
          </button>
        </div>
      </div>

      <div className="card">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索任务名称、复盘内容..."
                className="input pl-9"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as HistoryFilterOptions['status'])
                }
                className="input appearance-none pr-10"
              >
                <option value="all">全部状态</option>
                <option value="completed">已完成</option>
                <option value="abandoned">已放弃</option>
                <option value="manual">手动记录</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={planFilter || ''}
                onChange={(e) => setPlanFilter(e.target.value || undefined)}
                className="input appearance-none pr-10"
              >
                <option value="">全部周计划</option>
                {weeklyPlans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.title} ({plan.weekStartDate.slice(5)})
                  </option>
                ))}
              </select>
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`btn flex items-center justify-center gap-1 ${
                showAdvanced ? 'btn-secondary' : 'btn-ghost'
              }`}
            >
              <Filter className="w-4 h-4" />
              高级筛选
              {activeFilterCount > 0 && (
                <span className="ml-1 w-5 h-5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {showAdvanced && (
            <div className="pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-2 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" />
                  按标签筛选（多选）
                </label>
                {allTags.length === 0 ? (
                  <p className="text-xs text-gray-400 py-2">暂无标签</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {allTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                          tagFilter.includes(tag)
                            ? 'bg-primary-500 text-white border-primary-500'
                            : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-primary-300 hover:text-primary-600'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                )}
                {tagFilter.length > 0 && (
                  <button
                    onClick={() => setTagFilter([])}
                    className="text-xs text-primary-500 hover:underline mt-2"
                  >
                    清空标签选择
                  </button>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  开始日期
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="input text-sm py-2"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  结束日期
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="input text-sm py-2"
                />
              </div>
            </div>
          )}

          {activeFilterCount > 0 && (
            <div className="flex items-center gap-2 pt-3 border-t border-gray-100 flex-wrap">
              <span className="text-xs text-gray-500">已选筛选：</span>
              {statusFilter !== 'all' && (
                <span className="tag tag-sm tag-default">
                  {statusConfig[statusFilter]?.label || statusFilter}
                  <button onClick={() => setStatusFilter('all')} className="ml-1">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {planFilter && (
                <span className="tag tag-sm tag-secondary">
                  周计划：{weeklyPlans.find((p) => p.id === planFilter)?.title}
                  <button onClick={() => setPlanFilter(undefined)} className="ml-1">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {tagFilter.map((t) => (
                <span key={t} className="tag tag-sm tag-primary">
                  {t}
                  <button onClick={() => toggleTag(t)} className="ml-1">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {startDate && (
                <span className="tag tag-sm tag-default">
                  起：{startDate}
                  <button onClick={() => setStartDate('')} className="ml-1">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {endDate && (
                <span className="tag tag-sm tag-default">
                  止：{endDate}
                  <button onClick={() => setEndDate('')} className="ml-1">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {searchQuery && (
                <span className="tag tag-sm tag-default">
                  搜：{searchQuery}
                  <button onClick={() => setSearchQuery('')} className="ml-1">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button
                onClick={resetFilters}
                className="ml-auto text-xs text-primary-600 hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                重置全部
              </button>
            </div>
          )}
        </div>
      </div>

      {filteredSessions.length === 0 ? (
        <div className="card text-center py-12">
          <Clock className="w-16 h-16 mx-auto mb-4 text-gray-200" />
          <p className="text-gray-500 text-lg mb-2">暂无符合条件的记录</p>
          <p className="text-gray-400 text-sm">
            {activeFilterCount > 0
              ? '尝试调整筛选条件'
              : '专注完成番茄钟后，记录会自动出现在这里'}
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {Object.entries(groupedSessions).map(([date, dateSessions]) => {
            const dayMinutes = dateSessions.reduce(
              (s, ses) => s + (ses.status === 'completed' ? ses.plannedDuration : 0),
              0
            );
            const isToday = date === getTodayStr();
            return (
              <div key={date}>
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-3">
                    <h2
                      className={`text-base font-semibold ${
                        isToday ? 'text-primary-600' : 'text-gray-700'
                      }`}
                    >
                      {date} {isToday && <span className="text-xs font-normal">(今天)</span>}
                    </h2>
                    <span className="text-xs text-gray-500">
                      {dateSessions.length} 条 · {dayMinutes} 分钟专注
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  {dateSessions.map((session) => {
                    const task = tasks.find((t) => t.id === session.taskId);
                    const plan = weeklyPlans.find((p) => p.id === session.weeklyPlanId);
                    const StatusIcon = statusConfig[session.status]?.icon || Clock;
                    return (
                      <div
                        key={session.id}
                        className="card card-hover !p-4"
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                              statusConfig[session.status]?.class || ''
                            }`}
                          >
                            <StatusIcon className="w-5 h-5" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h3 className="font-medium text-gray-800 truncate">
                                {task?.name || '未命名任务'}
                              </h3>
                              <span
                                className={`tag tag-xs ${
                                  statusConfig[session.status]?.class || ''
                                }`}
                              >
                                {statusConfig[session.status]?.label || session.status}
                              </span>
                              {plan && (
                                <span className="tag tag-xs tag-secondary flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {plan.title}
                                </span>
                              )}
                              {session.rating && (
                                <span className="tag tag-xs tag-warning">
                                  {session.rating}/5
                                </span>
                              )}
                            </div>

                            {task?.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {task.tags.slice(0, 3).map((tag) => (
                                  <span
                                    key={tag}
                                    className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}

                            <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                              <span>{formatDateTime(session.startTime)}</span>
                              <span>
                                时长：{formatDuration(session.actualDuration || 0)}
                                {session.actualDuration !== session.plannedDuration &&
                                  ` (计划 ${session.plannedDuration}m)`}
                              </span>
                            </div>

                            {(session.summary || session.reviewNote) && (
                              <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                                {session.summary && (
                                  <div>
                                    <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">
                                      总结
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      {session.summary}
                                    </p>
                                  </div>
                                )}
                                {session.reviewNote && (
                                  <div className="pt-2 border-t border-gray-100">
                                    <p className="text-[10px] font-semibold text-secondary-500 uppercase mb-1 flex items-center gap-1">
                                      <BookOpen className="w-3 h-3" />
                                      复盘备注
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      {session.reviewNote}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}

                            {session.abandonReason && (
                              <div className="mt-3 p-2.5 bg-red-50 rounded-xl text-xs text-red-600 border border-red-100">
                                放弃原因：{session.abandonReason}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              onClick={() => {
                                setEditingSession(session);
                                setEditSummary(session.summary || '');
                                setEditReviewNote(session.reviewNote || '');
                              }}
                              className="p-2 rounded-xl hover:bg-gray-100 text-gray-500"
                              title="编辑复盘"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('确定删除该条番茄记录吗？')) {
                                  deleteSession(session.id);
                                }
                              }}
                              className="p-2 rounded-xl hover:bg-red-50 text-gray-500 hover:text-red-500"
                              title="删除记录"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editingSession && (
        <div
          className="modal-overlay"
          onClick={() => setEditingSession(null)}
        >
          <div
            className="modal-content p-6 max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4">编辑复盘内容</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  总结
                </label>
                <textarea
                  value={editSummary}
                  onChange={(e) => setEditSummary(e.target.value)}
                  placeholder="这次专注完成了什么？"
                  className="textarea h-24"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <BookOpen className="w-4 h-4 text-secondary-500" />
                  复盘备注
                </label>
                <textarea
                  value={editReviewNote}
                  onChange={(e) => setEditReviewNote(e.target.value)}
                  placeholder="更深入的思考、收获、不足..."
                  className="textarea h-24"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setEditingSession(null)}
                className="btn btn-ghost"
              >
                取消
              </button>
              <button onClick={handleSaveEdit} className="btn btn-primary">
                保存修改
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
