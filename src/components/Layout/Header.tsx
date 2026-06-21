import { Timer, Settings } from 'lucide-react';
import { useState } from 'react';
import { useStore } from '../../store/useStore';

export const Header = () => {
  const [showSettings, setShowSettings] = useState(false);
  const { settings, updateSettings, resetAllData, generateDemoData } = useStore();

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
            <Timer className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">番茄专注</h1>
            <p className="text-xs text-gray-500">让学习更高效</p>
          </div>
        </div>

        <button
          onClick={() => setShowSettings(true)}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <Settings className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal-content p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-6">设置</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  默认番茄钟时长（分钟）
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={settings.defaultDuration}
                  onChange={(e) => updateSettings({ defaultDuration: parseInt(e.target.value) || 25 })}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  休息时长（分钟）
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={settings.breakDuration}
                  onChange={(e) => updateSettings({ breakDuration: parseInt(e.target.value) || 5 })}
                  className="input"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">提示音效</span>
                <button
                  onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.soundEnabled ? 'bg-primary-500' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                      settings.soundEnabled ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">数据管理</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      generateDemoData();
                      setShowSettings(false);
                    }}
                    className="btn btn-secondary btn-sm"
                  >
                    生成示例数据
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('确定要重置所有数据吗？此操作不可撤销。')) {
                        resetAllData();
                        setShowSettings(false);
                      }
                    }}
                    className="btn btn-danger btn-sm"
                  >
                    重置所有数据
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowSettings(false)}
                className="btn btn-primary"
              >
                完成
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
