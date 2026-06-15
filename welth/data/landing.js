import {
  BarChart3,
  Receipt,
  PieChart,
  CreditCard,
  Globe,
  Zap,
} from "lucide-react";

export const statsData = [
  { value: "50K+", label: "Active Users" },
  { value: "$2B+", label: "Transactions Tracked" },
  { value: "99.9%", label: "Uptime" },
  { value: "4.9/5", label: "User Rating" },
];

export const featuresData = [
  {
    icon: <BarChart3 className="h-8 w-8" />,
    title: "Advanced Analytics",
    description: "Get detailed insights into your spending patterns with AI-powered analytics and beautiful visualizations.",
  },
  {
    icon: <Receipt className="h-8 w-8" />,
    title: "Smart Receipt Scanner",
    description: "Extract data automatically from receipts using our advanced AI technology.",
  },
  {
    icon: <PieChart className="h-8 w-8" />,
    title: "Budget Planning",
    description: "Create and manage budgets with intelligent alerts when you're approaching your limits.",
  },
  {
    icon: <CreditCard className="h-8 w-8" />,
    title: "Multi-Account Support",
    description: "Manage multiple bank accounts and credit cards all in one place seamlessly.",
  },
  {
    icon: <Globe className="h-8 w-8" />,
    title: "Multi-Currency",
    description: "Support for multiple currencies with real-time conversion rates.",
  },
  {
    icon: <Zap className="h-8 w-8" />,
    title: "Automated Insights",
    description: "Get monthly financial reports and personalized insights delivered to your inbox.",
  },
];

export const howItWorksData = [
  {
    icon: <CreditCard className="h-8 w-8" />,
    title: "1. Create Your Account",
    description: "Get started in minutes with our simple and secure sign-up process.",
  },
  {
    icon: <BarChart3 className="h-8 w-8" />,
    title: "2. Track Your Spending",
    description: "Add transactions manually or scan receipts with our AI-powered scanner.",
  },
  {
    icon: <PieChart className="h-8 w-8" />,
    title: "3. Get Insights",
    description: "Receive personalized insights and recommendations to optimize your finances.",
  },
];

export const testimonialsData = [
  {
    name: "Sarah Johnson",
    role: "Small Business Owner",
    image: "https://randomuser.me/api/portraits/women/75.jpg",
    quote: "Welth has completely transformed how I manage my business finances. The AI insights are incredibly accurate!",
  },
  {
    name: "Michael Chen",
    role: "Freelance Designer",
    image: "https://randomuser.me/api/portraits/men/75.jpg",
    quote: "The receipt scanner saves me hours every month. I just snap a photo and everything is categorized automatically.",
  },
  {
    name: "Emily Rodriguez",
    role: "Financial Analyst",
    image: "https://randomuser.me/api/portraits/women/74.jpg",
    quote: "As a financial analyst, I'm impressed by the depth of insights Welth provides. It's like having a personal CFO.",
  },
];