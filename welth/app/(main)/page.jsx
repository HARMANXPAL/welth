import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, CreditCard, Globe, Shield, Zap, PieChart } from "lucide-react";

const features = [
  {
    icon: <BarChart3 className="h-8 w-8 text-blue-600" />,
    title: "Advanced Analytics",
    description: "Get detailed insights into your spending patterns with AI-powered analytics.",
  },
  {
    icon: <CreditCard className="h-8 w-8 text-blue-600" />,
    title: "Multi-Account Support",
    description: "Manage multiple bank accounts and credit cards in one place.",
  },
  {
    icon: <Globe className="h-8 w-8 text-blue-600" />,
    title: "Smart Budgeting",
    description: "Set budgets and get alerts when you're close to your limits.",
  },
  {
    icon: <Shield className="h-8 w-8 text-blue-600" />,
    title: "Secure & Private",
    description: "Bank-level security to keep your financial data safe.",
  },
  {
    icon: <Zap className="h-8 w-8 text-blue-600" />,
    title: "AI Receipt Scanner",
    description: "Scan receipts instantly and auto-categorize transactions.",
  },
  {
    icon: <PieChart className="h-8 w-8 text-blue-600" />,
    title: "Automated Reports",
    description: "Get monthly financial reports delivered to your inbox.",
  },
];

const stats = [
  { value: "50K+", label: "Active Users" },
  { value: "$2B+", label: "Transactions Tracked" },
  { value: "99.9%", label: "Uptime" },
  { value: "4.9/5", label: "User Rating" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-8xl lg:text-[105px] pb-6 gradient-title font-extrabold">
            Manage Your Finances <br /> with Intelligence
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            An AI-powered financial management platform that helps you track,
            analyze, and optimize your spending with real-time insights.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/dashboard">
              <Button size="lg" className="px-8">
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="px-8">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-blue-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything you need to manage your finances
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="p-6 rounded-lg border hover:shadow-lg transition-shadow">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-blue-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Take Control of Your Finances?
          </h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already managing their finances smarter with Welth.
          </p>
          <Link href="/dashboard">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 px-8">
              Start Free Today <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}