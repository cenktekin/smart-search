
import React from 'react';

interface CategoryFilterProps {
  categories: string[];
  activeCategory: string;
  setActiveCategory: (category: string) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({ categories, activeCategory, setActiveCategory }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map(category => (
        <button
          key={category}
          onClick={() => setActiveCategory(category)}
          className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kde-accent focus:ring-offset-kde-panel-light dark:focus:ring-offset-kde-panel-dark ${
            activeCategory === category
              ? 'bg-kde-accent text-white'
              : 'bg-kde-bg-light dark:bg-kde-bg-dark text-kde-text-light dark:text-kde-text-dark hover:bg-kde-border-light dark:hover:bg-kde-border-dark'
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
};
