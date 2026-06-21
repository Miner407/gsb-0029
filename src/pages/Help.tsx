import { useState } from 'react';
import { 
  HelpCircle, CheckCircle2, Play, Pause, X, Plus, Edit3, Trash2, 
  ChevronDown, ChevronUp, Download, Upload, Database, FileText
} from 'lucide-react';
import { useStore } from '../store/useStore';

interface VerificationStep {
  id: string;
  title: string;
  description: string;
  steps: string[];
  expectedResult: string;
  completed: boolean;
}

export const Help = () => {
  const { resetAllData, generateDemoData, tasks, sessions } = useStore();
  const [expandedSection, setExpandedSection] = useState<string | null>('verification');
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const verificationSteps: VerificationStep[] = [
    {
      id: 'create-task',
      title: '1. 创建任务',
      description: '验证任务创建功能是否正常工作',
      steps: [
        '点击导航栏的「任务」进入任务管理页面',
        '点击右上角「新建任务」按钮',
        '填写任务名称（如：测试任务）',
        '添加1-2个标签（如：学习、测试）',
        '设置预估番茄数为2',
        '点击「创建」按钮',
      ],
      expectedResult: '任务列表中出现新创建的任务，显示任务名称、标签和进度条',
      completed: completedSteps.has('create-task'),
    },
    {
      id: 'edit-task',
      title: '2. 编辑任务',
      description: '验证任务编辑功能是否正常工作',
      steps: [
        '在任务列表中找到刚创建的任务',
        '点击任务右侧的编辑图标（铅笔）',
        '修改任务名称和描述',
        '添加或删除标签',
        '点击「保存」按钮',
      ],
      expectedResult: '任务信息更新为修改后的内容',
      completed: completedSteps.has('edit-task'),
    },
    {
      id: 'start-timer',
      title: '3. 启动番茄钟',
      description: '验证番茄钟计时功能是否正常工作',
      steps: [
        '返回首页，在待办任务列表中点击刚才创建的任务',
        '确认任务已被选中（显示橙色边框）',
        '选择25分钟时长',
        '点击「开始专注」按钮',
        '观察倒计时是否开始，圆形进度条是否动画',
      ],
      expectedResult: '计时器开始倒计时，显示「专注中」状态，圆形进度条逐渐减少',
      completed: completedSteps.has('start-timer'),
    },
    {
      id: 'pause-resume',
      title: '4. 暂停和继续',
      description: '验证暂停和继续功能是否正常工作',
      steps: [
        '在计时过程中点击「暂停」按钮',
        '确认计时器暂停，显示「已暂停」状态',
        '等待几秒，确认时间没有继续减少',
        '点击「继续」按钮',
        '确认计时器继续运行',
      ],
      expectedResult: '暂停时时间停止，继续后时间继续减少',
      completed: completedSteps.has('pause-resume'),
    },
    {
      id: 'abandon-timer',
      title: '5. 放弃番茄钟',
      description: '验证放弃功能是否正常工作',
      steps: [
        '启动一个新的番茄钟（至少等待1分钟）',
        '点击「放弃」按钮',
        '在弹出的对话框中填写放弃原因',
        '点击「确认放弃」',
        '前往历史记录页面查看',
      ],
      expectedResult: '历史记录中出现一条「已放弃」的记录，显示放弃原因',
      completed: completedSteps.has('abandon-timer'),
    },
    {
      id: 'complete-timer',
      title: '6. 完成番茄钟和复盘',
      description: '验证完成和复盘功能是否正常工作',
      steps: [
        '启动一个1分钟的番茄钟（方便快速测试）',
        '等待计时结束',
        '在复盘弹窗中设置打断次数为1次',
        '填写学习总结',
        '点击「保存记录」',
      ],
      expectedResult: '历史记录中出现一条「已完成」的记录，显示打断次数和总结',
      completed: completedSteps.has('complete-timer'),
    },
    {
      id: 'filter-tags',
      title: '7. 按标签筛选',
      description: '验证标签筛选功能是否正常工作',
      steps: [
        '创建多个带有不同标签的任务',
        '在首页或任务管理页面点击某个标签',
        '观察任务列表是否只显示包含该标签的任务',
        '点击「清除筛选」按钮',
      ],
      expectedResult: '筛选后只显示符合条件的任务，清除筛选后恢复全部显示',
      completed: completedSteps.has('filter-tags'),
    },
    {
      id: 'manual-entry',
      title: '8. 补录记录',
      description: '验证手动补录功能是否正常工作',
      steps: [
        '进入历史记录页面',
        '点击右上角「补录记录」按钮',
        '选择一个任务，填写专注时长和开始时间',
        '点击「保存记录」',
      ],
      expectedResult: '历史记录中出现一条「补录」的记录',
      completed: completedSteps.has('manual-entry'),
    },
    {
      id: 'statistics',
      title: '9. 查看统计数据',
      description: '验证统计功能是否正常工作',
      steps: [
        '完成至少2个番茄钟',
        '进入统计页面',
        '查看今日统计数据',
        '查看近7天趋势图表',
        '查看每日详情表格',
      ],
      expectedResult: '统计数据正确显示，图表正常渲染，数据与实际记录一致',
      completed: completedSteps.has('statistics'),
    },
    {
      id: 'data-persistence',
      title: '10. 数据持久化',
      description: '验证localStorage存储功能是否正常工作',
      steps: [
        '确认当前有任务和番茄记录',
        '刷新浏览器页面',
        '重新打开应用',
        '检查任务和记录是否仍然存在',
      ],
      expectedResult: '刷新页面后，所有数据保持不变',
      completed: completedSteps.has('data-persistence'),
    },
  ];

  const toggleStep = (stepId: string) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepId)) {
        next.delete(stepId);
      } else {
        next.add(stepId);
      }
      return next;
    });
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleExport = () => {
    const data = {
      tasks,
      sessions,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pomodoro-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.tasks && data.sessions) {
          localStorage.setItem('pomodoro_tasks', JSON.stringify(data.tasks));
          localStorage.setItem('pomodoro_sessions', JSON.stringify(data.sessions));
          window.location.reload();
        } else {
          alert('无效的数据文件格式');
        }
      } catch {
        alert('文件解析失败');
      }
    };
    reader.readAsText(file);
  };

  const progress = Math.round((completedSteps.size / verificationSteps.length) * 100);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">帮助中心</h1>
        <p className="text-gray-500">功能说明与手动验证指南</p>
      </div>

      <div className="card bg-gradient-to-r from-primary-50 to-secondary-50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
              <HelpCircle className="w-6 h-6 text-primary-500" />
            </div>
            <div>
              <h2 className="font-bold text-gray-800">功能验证进度</h2>
              <p className="text-sm text-gray-500">
                {completedSteps.size} / {verificationSteps.length} 项已验证
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-3xl font-bold text-primary-500">{progress}%</span>
          </div>
        </div>
        <div className="progress-bar h-3">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="space-y-4">
        <div
          className="card cursor-pointer"
          onClick={() => toggleSection('verification')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-800">手动验证步骤</h2>
                <p className="text-sm text-gray-500">按步骤验证所有功能是否正常</p>
              </div>
            </div>
            {expandedSection === 'verification' ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>

          {expandedSection === 'verification' && (
            <div className="mt-6 space-y-4">
              {verificationSteps.map((step, index) => (
                <div
                  key={step.id}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    step.completed
                      ? 'bg-green-50 border-green-200'
                      : 'bg-white border-gray-100'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStep(step.id);
                      }}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                        step.completed
                          ? 'bg-green-500 border-green-500'
                          : 'border-gray-300 hover:border-primary-400'
                      }`}
                    >
                      {step.completed && (
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      )}
                    </button>
                    <div className="flex-1">
                      <h3 className={`font-medium mb-1 ${
                        step.completed ? 'text-green-700' : 'text-gray-800'
                      }`}>
                        {step.title}
                      </h3>
                      <p className="text-sm text-gray-500 mb-3">{step.description}</p>
                      
                      <div className="bg-white/70 rounded-lg p-3 mb-3">
                        <p className="text-xs font-medium text-gray-500 mb-2">操作步骤：</p>
                        <ol className="text-sm text-gray-600 space-y-1">
                          {step.steps.map((s, i) => (
                            <li key={i} className="flex gap-2">
                              <span className="text-gray-400">{i + 1}.</span>
                              <span>{s}</span>
                            </li>
                          ))}
                        </ol>
                      </div>

                      <div className="bg-primary-50 rounded-lg p-3">
                        <p className="text-xs font-medium text-primary-600 mb-1">预期结果：</p>
                        <p className="text-sm text-primary-700">{step.expectedResult}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          className="card cursor-pointer"
          onClick={() => toggleSection('quickstart')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                <Play className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-800">快速入门</h2>
                <p className="text-sm text-gray-500">番茄工作法使用指南</p>
              </div>
            </div>
            {expandedSection === 'quickstart' ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>

          {expandedSection === 'quickstart' && (
            <div className="mt-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-primary-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold">1</div>
                    <h3 className="font-medium text-primary-800">创建任务</h3>
                  </div>
                  <p className="text-sm text-primary-700">
                    在任务管理页面创建你的学习任务，设置预估番茄数和标签。
                  </p>
                </div>
                <div className="p-4 bg-secondary-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-secondary-500 rounded-full flex items-center justify-center text-white font-bold">2</div>
                    <h3 className="font-medium text-secondary-800">选择任务</h3>
                  </div>
                  <p className="text-sm text-secondary-700">
                    在首页点击一个任务，设置番茄钟时长，点击开始专注。
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">3</div>
                    <h3 className="font-medium text-green-800">专注学习</h3>
                  </div>
                  <p className="text-sm text-green-700">
                    在25分钟内专注于任务，尽量避免分心。需要休息时可以暂停。
                  </p>
                </div>
                <div className="p-4 bg-amber-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold">4</div>
                    <h3 className="font-medium text-amber-800">复盘总结</h3>
                  </div>
                  <p className="text-sm text-amber-700">
                    完成后记录打断次数和学习总结，帮助你持续改进。
                  </p>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <h3 className="font-medium text-gray-800 mb-2">番茄工作法原则</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-start gap-2">
                    <Play className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                    <span>一个番茄钟（默认25分钟）内只做一个任务</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Pause className="w-4 h-4 text-secondary-500 mt-0.5 flex-shrink-0" />
                    <span>每完成一个番茄钟休息5分钟</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <X className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>如果被打断，记录打断次数或放弃当前番茄钟</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>每完成4个番茄钟，休息15-30分钟</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        <div
          className="card cursor-pointer"
          onClick={() => toggleSection('data')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Database className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-800">数据管理</h2>
                <p className="text-sm text-gray-500">数据导入导出与重置</p>
              </div>
            </div>
            {expandedSection === 'data' ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>

          {expandedSection === 'data' && (
            <div className="mt-6 space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    generateDemoData();
                  }}
                  className="p-4 bg-secondary-50 rounded-xl border-2 border-transparent hover:border-secondary-200 transition-colors text-left"
                >
                  <FileText className="w-8 h-8 text-secondary-500 mb-2" />
                  <h3 className="font-medium text-secondary-800 mb-1">生成示例数据</h3>
                  <p className="text-sm text-secondary-600">
                    快速生成一些示例任务和记录，方便体验功能
                  </p>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExport();
                  }}
                  className="p-4 bg-green-50 rounded-xl border-2 border-transparent hover:border-green-200 transition-colors text-left"
                >
                  <Download className="w-8 h-8 text-green-500 mb-2" />
                  <h3 className="font-medium text-green-800 mb-1">导出数据</h3>
                  <p className="text-sm text-green-600">
                    将所有数据导出为JSON文件备份
                  </p>
                </button>

                <label className="p-4 bg-primary-50 rounded-xl border-2 border-transparent hover:border-primary-200 transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 text-primary-500 mb-2" />
                  <h3 className="font-medium text-primary-800 mb-1">导入数据</h3>
                  <p className="text-sm text-primary-600">
                    从JSON文件恢复之前导出的数据
                  </p>
                  <input
                    type="file"
                    accept=".json"
                    onChange={(e) => {
                      e.stopPropagation();
                      handleImport(e);
                    }}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-red-800 mb-1">重置所有数据</h3>
                    <p className="text-sm text-red-600">
                      警告：这将删除所有任务和番茄记录，此操作不可撤销
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('确定要重置所有数据吗？此操作不可撤销！')) {
                        resetAllData();
                        setCompletedSteps(new Set());
                      }
                    }}
                    className="btn btn-danger btn-sm"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    重置数据
                  </button>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <h3 className="font-medium text-gray-800 mb-2">数据完整性检查</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">任务总数</p>
                    <p className="text-2xl font-bold text-gray-800">{tasks.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">记录总数</p>
                    <p className="text-2xl font-bold text-gray-800">{sessions.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">已完成任务</p>
                    <p className="text-2xl font-bold text-green-600">
                      {tasks.filter((t) => t.status === 'completed').length}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">完成番茄</p>
                    <p className="text-2xl font-bold text-primary-600">
                      {sessions.filter((s) => s.status === 'completed' || s.status === 'manual').length}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-4">
                  数据存储在浏览器的 localStorage 中，清除浏览器数据会导致数据丢失。
                  建议定期导出数据备份。
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
