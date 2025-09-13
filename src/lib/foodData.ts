// Food data for Food Battle Arena
export interface FoodItem {
  id: string;
  name: string;
  category: string;
  cuisine: string;
  description: string;
  image: string;
  rating: number;
  reviewCount: number;
  priceRange: '$' | '$$' | '$$$' | '$$$$';
  dietaryInfo: string[];
  calories?: number;
  prepTime?: number; // minutes
}

export interface FoodBattle {
  id: string;
  title: string;
  description?: string;
  foodA: FoodItem & { votes: number; arguments: BattleArgument[] };
  foodB: FoodItem & { votes: number; arguments: BattleArgument[] };
  createdAt: Date;
  endsAt: Date;
  totalVotes: number;
  isActive: boolean;
}

export interface BattleArgument {
  id: string;
  battleId: string;
  foodId: string;
  userId: string;
  username: string;
  content: string;
  likes: number;
  createdAt: Date;
}

export const sampleFoods: FoodItem[] = [
  {
    id: 'pizza-margherita',
    name: 'Margherita Pizza',
    category: 'Main Course',
    cuisine: 'Italian',
    description: 'Classic pizza with fresh mozzarella, tomato sauce, and basil',
    image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500',
    rating: 4.5,
    reviewCount: 2847,
    priceRange: '$$',
    dietaryInfo: ['Vegetarian'],
    calories: 250,
    prepTime: 15
  },
  {
    id: 'burger-classic',
    name: 'Classic Cheeseburger',
    category: 'Main Course',
    cuisine: 'American',
    description: 'Juicy beef patty with cheese, lettuce, tomato, and special sauce',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500',
    rating: 4.3,
    reviewCount: 1923,
    priceRange: '$$',
    dietaryInfo: [],
    calories: 540,
    prepTime: 10
  },
  {
    id: 'sushi-salmon',
    name: 'Salmon Sashimi',
    category: 'Main Course',
    cuisine: 'Japanese',
    description: 'Fresh Atlantic salmon, expertly sliced and served with wasabi',
    image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=500',
    rating: 4.7,
    reviewCount: 1456,
    priceRange: '$$$',
    dietaryInfo: ['Gluten-Free', 'Keto'],
    calories: 180,
    prepTime: 5
  },
  {
    id: 'tacos-carnitas',
    name: 'Carnitas Tacos',
    category: 'Main Course',
    cuisine: 'Mexican',
    description: 'Slow-cooked pork with onions, cilantro, and lime on corn tortillas',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=500',
    rating: 4.4,
    reviewCount: 987,
    priceRange: '$',
    dietaryInfo: ['Gluten-Free'],
    calories: 320,
    prepTime: 8
  },
  {
    id: 'pasta-carbonara',
    name: 'Spaghetti Carbonara',
    category: 'Main Course',
    cuisine: 'Italian',
    description: 'Creamy pasta with pancetta, eggs, parmesan, and black pepper',
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=500',
    rating: 4.6,
    reviewCount: 2134,
    priceRange: '$$',
    dietaryInfo: [],
    calories: 450,
    prepTime: 20
  },
  {
    id: 'ramen-tonkotsu',
    name: 'Tonkotsu Ramen',
    category: 'Main Course',
    cuisine: 'Japanese',
    description: 'Rich pork bone broth with noodles, chashu, and soft-boiled egg',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500',
    rating: 4.8,
    reviewCount: 1678,
    priceRange: '$$',
    dietaryInfo: [],
    calories: 380,
    prepTime: 25
  }
];

export const searchFood = async (query: string): Promise<FoodItem[]> => {
  // In production, this could integrate with Yelp API, Zomato, or other food APIs
  return sampleFoods.filter(food => 
    food.name.toLowerCase().includes(query.toLowerCase()) ||
    food.cuisine.toLowerCase().includes(query.toLowerCase()) ||
    food.category.toLowerCase().includes(query.toLowerCase())
  );
};

export const getFoodsByCategory = (category: string): FoodItem[] => {
  return sampleFoods.filter(food => 
    food.category.toLowerCase() === category.toLowerCase()
  );
};

export const getFoodsByCuisine = (cuisine: string): FoodItem[] => {
  return sampleFoods.filter(food => 
    food.cuisine.toLowerCase() === cuisine.toLowerCase()
  );
};

export const getCuisineColor = (cuisine: string): string => {
  const cuisineColors: { [key: string]: string } = {
    'italian': 'bg-green-500/20 text-green-400',
    'american': 'bg-blue-500/20 text-blue-400',
    'japanese': 'bg-red-500/20 text-red-400',
    'mexican': 'bg-orange-500/20 text-orange-400',
    'chinese': 'bg-yellow-500/20 text-yellow-400',
    'indian': 'bg-purple-500/20 text-purple-400',
    'french': 'bg-pink-500/20 text-pink-400',
    'thai': 'bg-emerald-500/20 text-emerald-400',
    'mediterranean': 'bg-cyan-500/20 text-cyan-400',
    'korean': 'bg-violet-500/20 text-violet-400'
  };
  
  return cuisineColors[cuisine.toLowerCase()] || 'bg-gray-500/20 text-gray-400';
};

export const getPriceRangeColor = (priceRange: string): string => {
  switch (priceRange) {
    case '$': return 'text-green-400';
    case '$$': return 'text-yellow-400';
    case '$$$': return 'text-orange-400';
    case '$$$$': return 'text-red-400';
    default: return 'text-gray-400';
  }
};

export const formatCalories = (calories?: number): string => {
  if (!calories) return 'N/A';
  return `${calories} cal`;
};

export const formatPrepTime = (minutes?: number): string => {
  if (!minutes) return 'N/A';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};