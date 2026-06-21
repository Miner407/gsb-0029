import { useState, useRef } from 'react';
import {
  HelpCircle,
  Clock,
  Target,
  BarChart3,
  Database,
  Download,
  Upload,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  FileJson,
  Info,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { getTodayStr, formatDateTime } from '../utils/dateUtils';
import { STORAGE_KEYS } from '../utils/storageUtils';
import { validateImportData } from '../utils/statistics';

interface ImportResult {
  success: boolean;
  message: string;
  warnings?: string[];
  errors?: string[];
  details?: {
    tasksImported: number;
    sessionsImported: number;
    plansImported: number;
    mode: 'merge' | 'replace';
  };
}

export const Help = () => {
  const { resetAllData, exportAllData, importAllData, generateDemoData, tasks, sessions, weeklyPlans, settings } =
    useStore();

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showDemoConfirm, setShowDemoConfirm] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data = exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pomodoro-backup-${getTodayStr()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (file: File) => {
    setIsImporting(true);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const raw = e.target?.result as string;
        let parsedData: unknown;
        try {
          parsedData = JSON.parse(raw);
        } catch {
          setImportResult({
            success: false,
            message: '文件解析失败：JSON 格式无效',
            errors: ['请检查导出文件是否被篡改'],
          });
          setIsImporting(false);
          return;
        }

        const validation = validateImportData(parsedData);

        if (!validation.valid) {
          setImportResult({
            success: false,
            message: `格式校验未通过，共发现 ${validation.errors.length} 个严重错误`,
            errors: validation.errors,
            warnings: validation.warnings,
          });
          setIsImporting(false);
          return;
        }

        const result = importAllData(parsedData, importMode);

        setImportResult({
          success: true,
          message:
            importMode === 'merge'
              ? '数据合并导入成功，重复 ID 已自动去重'
              : '数据替换导入成功，所有数据已覆盖',
          warnings: validation.warnings.length > 0 ? validation.warnings : undefined,
          details: {
            tasksImported: result.tasksImported || 0,
            sessionsImported: result.sessionsImported || 0,
            plansImported: result.plansImported || 0,
            mode: importMode,
          },
        });
      } catch (err) {
        setImportResult({
          success: false,
          message: `导入过程中发生错误：${(err as Error).message}`,
        });
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    reader.onerror = () => {
      setImportResult({
        success: false,
        message: '文件读取失败，请重试',
      });
      setIsImporting(false);
    };

    reader.readAsText(file, 'utf-8');
  };

  const handleReset = () => {
    resetAllData();
    setShowResetConfirm(false);
    localStorage.removeItem(STORAGE_KEYS.tasks);
    localStorage.removeItem(STORAGE_KEYS.sessions);
    localStorage.removeItem(STORAGE_KEYS.settings);
    localStorage.removeItem(STORAGE_KEYS.weeklyPlans);
  };

  const faqItems = [
    {
      icon: Clock,
      question: '番茄工作法是什么？',
      answer:
        '番茄工作法是一种时间管理方法，将工作时间拆分为 25 分钟的专注时段和 5 分钟的短休息。每完成 4 个番茄钟进行一次 15-30 分钟的长休息，有效提升专注力和避免疲劳。',
    },
    {
      icon: Target,
      question: '如何创建有效的任务？',
      answer:
        '任务名称要具体可执行（避免太宽泛的描述），合理预估需要的番茄数（通常单任务 2-6 个番茄），添加标签方便后续按主题归类复盘。优先创建可以在今天内完成的小任务。',
    },
    {
      icon: BarChart3,
      question: '复盘有什么价值？',
      answer:
        '每次完成番茄钟后及时记录「完成了什么」「遇到了什么」「有什么启发」，累计起来就是宝贵的学习日记。统计页面可以按标签、时间维度分析效率模式，帮你找到自己的高效时段。',
    },
    {
      icon: Database,
      question: '数据保存在哪里？',
      answer:
        `所有数据保存在浏览器的 localStorage 中，具体 key 为：${STORAGE_KEYS.tasks}（任务）、${STORAGE_KEYS.sessions}（番茄记录）、${STORAGE_KEYS.settings}（设置）、${STORAGE_KEYS.weeklyPlans}（周计划）。请定期导出备份，清理浏览器数据会导致丢失。`,
    },
    {
      icon: Sparkles,
      question: '什么是周计划功能？',
      answer:
        '周计划功能可以帮你设定本周的专注时长目标、番茄数目标，并指定重点关注的学习标签。首页会展示本周进度和智能推荐的任务。统计页可以看到每个标签的贡献占比和未达成原因。',
    },
    {
      icon: ShieldAlert,
      question: '导入数据时如何避免丢失？',
      answer:
        '推荐使用「合并导入」模式，系统会按 ID 自动去重，不会覆盖已有的相同 ID 记录。如果选择「替换模式」，所有现有数据会被完全清除，因此替换前请务必先导出当前数据作为备份。',
    },
  ];

  const quickTips = [
    '可以在设置中调整默认番茄时长、休息时长',
    '长时间专注前，建议先在任务管理中创建好任务清单',
    '首页的「今日建议」会优先推荐与本周周计划标签匹配的任务',
    '放弃番茄钟时写下原因，有助于后续分析效率障碍',
    '每周末记得给周计划做总结，填写未达成原因',
    '导出的 JSON 备份可用任意文本编辑器查看',
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">帮助中心</h1>
        <p className="text-gray-500 text-sm">使用指南、数据管理与常见问题</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="card">
          <div className="flex items-center gap-2 mb-5">
            <Database className="w-5 h-5 text-primary-500" />
            <h2 className="font-semibold text-gray-700">数据管理</h2>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-gray-800">{tasks.length}</p>
              <p className="text-xs text-gray-500 mt-1">任务数</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-gray-800">{sessions.length}</p>
              <p className="text-xs text-gray-500 mt-1">番茄记录</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-gray-800">{weeklyPlans.length}</p>
              <p className="text-xs text-gray-500 mt-1">周计划</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-xl border border-success-100 bg-success-50/40">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <h3 className="font-medium text-gray-800 flex items-center gap-2">
                    <Download className="w-4 h-4 text-success-600" />
                    导出完整数据
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    包含任务、番茄记录、复盘备注、周计划、设置。生成 JSON 文件。
                  </p>
                </div>
                <button
                  onClick={handleExport}
                  className="btn btn-success btn-sm flex-shrink-0"
                >
                  <FileJson className="w-4 h-4" />
                  导出
                </button>
              </div>
              <p className="text-[11px] text-gray-400">
                建议每周定期导出备份，文件名已包含日期
              </p>
            </div>

            <div className="p-4 rounded-xl border border-secondary-100 bg-secondary-50/40">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="font-medium text-gray-800 flex items-center gap-2">
                    <Upload className="w-4 h-4 text-secondary-600" />
                    导入数据备份
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    上传此前导出的 JSON 文件，自动校验格式完整性。
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImport(file);
                  }}
                  className="hidden"
                />
                <button
                  disabled={isImporting}
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn-secondary btn-sm flex-shrink-0 disabled:opacity-50"
                >
                  {isImporting ? '处理中...' : '选择文件'}
                </button>
              </div>

              <div className="flex gap-2 mb-2">
                <button
                  onClick={() => setImportMode('merge')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all border ${
                    importMode === 'merge'
                      ? 'bg-primary-500 text-white border-primary-500'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'
                  }`}
                >
                  合并导入（推荐）
                </button>
                <button
                  onClick={() => setImportMode('replace')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all border ${
                    importMode === 'replace'
                      ? 'bg-danger-500 text-white border-danger-500'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-danger-300'
                  }`}
                >
                  替换全部（危险）
                </button>
              </div>
              <p className="text-[11px] text-gray-400 flex items-start gap-1">
                <Info className="w-3 h-3 flex-shrink-0 mt-0.5" />
                合并模式按 ID 去重保留两者；替换模式先清空再写入。
              </p>
            </div>

            {importResult && (
              <div
                className={`p-4 rounded-xl border ${
                  importResult.success
                    ? 'bg-success-50 border-success-200'
                    : 'bg-danger-50 border-danger-200'
                }`}
              >
                <div className="flex items-start gap-2">
                  {importResult.success ? (
                    <CheckCircle2 className="w-5 h-5 text-success-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-danger-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-medium text-sm ${
                        importResult.success ? 'text-success-700' : 'text-danger-700'
                      }`}
                    >
                      {importResult.message}
                    </p>
                    {importResult.details && (
                      <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-gray-600">
                        <div className="bg-white rounded-lg p-2 text-center">
                          <p className="font-bold">{importResult.details.tasksImported}</p>
                          <p className="text-gray-400 mt-0.5">任务</p>
                        </div>
                        <div className="bg-white rounded-lg p-2 text-center">
                          <p className="font-bold">{importResult.details.sessionsImported}</p>
                          <p className="text-gray-400 mt-0.5">番茄</p>
                        </div>
                        <div className="bg-white rounded-lg p-2 text-center">
                          <p className="font-bold">{importResult.details.plansImported}</p>
                          <p className="text-gray-400 mt-0.5">周计划</p>
                        </div>
                      </div>
                    )}
                    {importResult.warnings && importResult.warnings.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-amber-600 mb-1">
                          ⚠️ 警告信息（{importResult.warnings.length}）
                        </p>
                        <ul className="text-[11px] text-amber-700 space-y-0.5 list-disc list-inside">
                          {importResult.warnings.slice(0, 5).map((w, i) => (
                            <li key={i}>{w}</li>
                          ))}
                          {importResult.warnings.length > 5 && (
                            <li>...还有 {importResult.warnings.length - 5} 条</li>
                          )}
                        </ul>
                      </div>
                    )}
                    {importResult.errors && importResult.errors.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-danger-600 mb-1">
                          错误详情
                        </p>
                        <ul className="text-[11px] text-danger-700 space-y-0.5 list-disc list-inside">
                          {importResult.errors.slice(0, 5).map((e, i) => (
                            <li key={i}>{e}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="p-4 rounded-xl border border-warning-100 bg-warning-50/40">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <h3 className="font-medium text-gray-800 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    生成演示数据
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    填充示例任务、番茄记录和周计划，用于体验功能。
                  </p>
                </div>
                <button
                  onClick={() => setShowDemoConfirm(true)}
                  className="btn btn-ghost btn-sm flex-shrink-0 border border-warning-200 text-warning-700 hover:bg-warning-50"
                >
                  生成
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-danger-100 bg-danger-50/40">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-medium text-gray-800 flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-danger-600" />
                    清空所有数据
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    删除全部任务、番茄记录、复盘备注、周计划和个性化设置。
                  </p>
                </div>
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="btn btn-danger btn-sm flex-shrink-0"
                >
                  清空
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <HelpCircle className="w-5 h-5 text-secondary-500" />
              <h2 className="font-semibold text-gray-700">常见问题 FAQ</h2>
            </div>
            <div className="space-y-4">
              {faqItems.map((item, idx) => (
                <details
                  key={idx}
                  className="group rounded-xl border border-gray-100 p-4 hover:border-gray-200 transition-all bg-gray-50/30 open:bg-white open:border-primary-100"
                >
                  <summary className="cursor-pointer list-none flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0 group-open:bg-primary-500 group-open:text-white transition-all">
                      <item.icon className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-gray-800 flex-1">
                      {item.question}
                    </span>
                    <span className="text-gray-400 text-sm group-open:hidden">
                      展开
                    </span>
                    <span className="text-primary-500 text-sm hidden group-open:inline">
                      收起
                    </span>
                  </summary>
                  <p className="mt-3 text-sm text-gray-600 leading-relaxed pl-11">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h2 className="font-semibold text-gray-700">使用小贴士</h2>
            </div>
            <ul className="space-y-2.5">
              {quickTips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-gray-600">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-600 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card bg-gradient-to-br from-primary-50 to-secondary-50 border-primary-100">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-5 h-5 text-primary-500" />
              <h2 className="font-semibold text-gray-700">关于本应用</h2>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              本项目是一个基于 React + TypeScript + Vite 的个人学习番茄钟与任务复盘工具，
              集成了番茄计时、任务管理、目标追踪、数据统计、历史复盘等功能。
              所有数据本地存储，无需后端服务，开箱即用。
            </p>
            <div className="mt-4 pt-4 border-t border-white/60 grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-gray-500">版本号</p>
                <p className="font-medium text-gray-700">v2.0.0</p>
              </div>
              <div>
                <p className="text-gray-500">导出格式</p>
                <p className="font-medium text-gray-700">JSON v2 + Markdown</p>
              </div>
              <div>
                <p className="text-gray-500">最近启动</p>
                <p className="font-medium text-gray-700">{formatDateTime(new Date().toISOString())}</p>
              </div>
              <div>
                <p className="text-gray-500">默认番茄</p>
                <p className="font-medium text-gray-700">{settings.defaultDuration} 分钟</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showResetConfirm && (
        <div className="modal-overlay" onClick={() => setShowResetConfirm(false)}>
          <div className="modal-content p-6 max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-danger-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-danger-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">确认清空数据？</h3>
                <p className="text-xs text-gray-500">此操作不可恢复</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4 bg-danger-50 p-3 rounded-xl border border-danger-100">
              所有任务、番茄记录、复盘备注、周计划和设置都将被永久删除，且无法恢复。
              <br />
              <strong>强烈建议先导出备份！</strong>
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="btn btn-ghost"
              >
                取消
              </button>
              <button onClick={handleReset} className="btn btn-danger">
                确认清空
              </button>
            </div>
          </div>
        </div>
      )}

      {showDemoConfirm && (
        <div className="modal-overlay" onClick={() => setShowDemoConfirm(false)}>
          <div className="modal-content p-6 max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">生成演示数据</h3>
                <p className="text-xs text-gray-500">将添加示例数据到现有数据</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              系统会生成示例任务、番茄记录、周计划等演示数据，帮助你快速体验完整功能。
              数据会与现有数据合并，不会覆盖。
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDemoConfirm(false)}
                className="btn btn-ghost"
              >
                取消
              </button>
              <button
                onClick={() => {
                  generateDemoData();
                  setShowDemoConfirm(false);
                }}
                className="btn btn-primary"
              >
                确认生成
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
