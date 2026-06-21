import { NavLink } from 'react-router-dom';
import { Home, ListTodo, CalendarDays, BarChart3, History, HelpCircle } from 'lucide-react';

const navItems = [
  { to: '/', icon: Home, label: '首页' },
  { to: '/tasks', icon: ListTodo, label: '任务' },
  { to: '/weekly', icon: CalendarDays, label: '周计划' },
  { to: '/statistics', icon: BarChart3, label: '统计' },
  { to: '/history', icon: History, label: '历史' },
  { to: '/help', icon: HelpCircle, label: '帮助' },
];

export const Navigation = () => {
  return (
    <>
      <nav className="hidden md:block w-64 bg-white/80 backdrop-blur-md border-r border-gray-100 min-h-screen p-4">
        <div className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'nav-item-active' : ''}`
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 z-40 px-2 py-2">
        <div className="flex justify-around">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center py-1 px-3 rounded-xl transition-colors ${
                  isActive ? 'text-primary-600' : 'text-gray-500'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs mt-0.5">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
};
