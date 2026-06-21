import { Tag, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { getAllTags } from '../utils/statistics';

interface TagFilterProps {
  compact?: boolean;
}

const tagColors = [
  'bg-primary-100 text-primary-700 border-primary-200',
  'bg-secondary-100 text-secondary-700 border-secondary-200',
  'bg-green-100 text-green-700 border-green-200',
  'bg-amber-100 text-amber-700 border-amber-200',
  'bg-purple-100 text-purple-700 border-purple-200',
  'bg-pink-100 text-pink-700 border-pink-200',
];

const getTagColor = (index: number) => tagColors[index % tagColors.length];

export const TagFilter = ({ compact = false }: TagFilterProps) => {
  const { tasks, selectedTags, setSelectedTags } = useStore();
  const allTags = getAllTags(tasks);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const clearFilter = () => {
    setSelectedTags([]);
  };

  if (allTags.length === 0) return null;

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2 items-center">
        <Tag className="w-4 h-4 text-gray-400" />
        {allTags.map((tag, index) => (
          <button
            key={tag}
            onClick={() => toggleTag(tag)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
              selectedTags.includes(tag)
                ? getTagColor(index)
                : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
            }`}
          >
            {tag}
          </button>
        ))}
        {selectedTags.length > 0 && (
          <button
            onClick={clearFilter}
            className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-0.5"
          >
            <X className="w-3 h-3" />
            清除
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-700 flex items-center gap-2">
          <Tag className="w-4 h-4" />
          按标签筛选
        </h3>
        {selectedTags.length > 0 && (
          <button
            onClick={clearFilter}
            className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            清除筛选
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {allTags.map((tag, index) => (
          <button
            key={tag}
            onClick={() => toggleTag(tag)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
              selectedTags.includes(tag)
                ? `${getTagColor(index)} shadow-sm`
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
};
