export const defaultCategories = [
  // Income Categories
  { id: "salary", name: "Salary", type: "INCOME", color: "#22c55e", icon: "💰" },
  { id: "freelance", name: "Freelance", type: "INCOME", color: "#16a34a", icon: "💻" },
  { id: "investments", name: "Investments", type: "INCOME", color: "#15803d", icon: "📈" },
  { id: "business", name: "Business", type: "INCOME", color: "#166534", icon: "🏢" },
  { id: "rental", name: "Rental Income", type: "INCOME", color: "#14532d", icon: "🏠" },
  { id: "other-income", name: "Other Income", type: "INCOME", color: "#4ade80", icon: "💵" },

  // Expense Categories
  { id: "housing", name: "Housing", type: "EXPENSE", color: "#ef4444", icon: "🏠" },
  { id: "transportation", name: "Transportation", type: "EXPENSE", color: "#f97316", icon: "🚗" },
  { id: "groceries", name: "Groceries", type: "EXPENSE", color: "#eab308", icon: "🛒" },
  { id: "utilities", name: "Utilities", type: "EXPENSE", color: "#84cc16", icon: "💡" },
  { id: "entertainment", name: "Entertainment", type: "EXPENSE", color: "#06b6d4", icon: "🎬" },
  { id: "food", name: "Food & Dining", type: "EXPENSE", color: "#f59e0b", icon: "🍔" },
  { id: "shopping", name: "Shopping", type: "EXPENSE", color: "#8b5cf6", icon: "🛍️" },
  { id: "healthcare", name: "Healthcare", type: "EXPENSE", color: "#ec4899", icon: "⚕️" },
  { id: "education", name: "Education", type: "EXPENSE", color: "#14b8a6", icon: "🎓" },
  { id: "travel", name: "Travel", type: "EXPENSE", color: "#f43f5e", icon: "✈️" },
  { id: "insurance", name: "Insurance", type: "EXPENSE", color: "#64748b", icon: "🛡️" },
  { id: "other-expense", name: "Other Expense", type: "EXPENSE", color: "#94a3b8", icon: "📦" },
];

export const categoryColors = defaultCategories.reduce((acc, category) => {
  acc[category.id] = category.color;
  return acc;
}, {});