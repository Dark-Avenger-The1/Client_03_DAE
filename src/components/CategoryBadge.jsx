import './CategoryBadge.css';

// category: 'Vegetable' | 'Fruit' | 'Livestock'
export default function CategoryBadge({ category }) {
  const tone = {
    Vegetable: 'badge-leaf',
    Fruit: 'badge-leaf-outline',
    Livestock: 'badge-silver',
  }[category] || 'badge-silver';

  return <span className={`category-badge ${tone}`}>{category}</span>;
}
