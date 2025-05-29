import {
  // SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  useUser,
  useAuth,
} from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

import {
  BarChart3,
  Receipt,
  PieChart,
  CreditCard,
  MessageSquare,
  Zap,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';

// Features Data
const featuresData = [
  { icon: <BarChart3 className="h-8 w-8 text-blue-600" />, title: "Advanced Analytics", description: "Get detailed insights into your spending patterns with AI-powered analytics" },
  { icon: <Receipt className="h-8 w-8 text-blue-600" />, title: "Smart Receipt Scanner", description: "Extract data automatically from receipts using advanced AI technology" },
  { icon: <PieChart className="h-8 w-8 text-blue-600" />, title: "Budget Planning", description: "Create and manage budgets with intelligent recommendations" },
  { icon: <CreditCard className="h-8 w-8 text-blue-600" />, title: "Multi-Account Support", description: "Manage multiple accounts and credit cards in one place" },
  { icon: <MessageSquare className="h-8 w-8 text-purple-600" />, title: "AI Finance Chatbot", description: "Chat with an AI assistant to manage and understand your finances better"},
  { icon: <Zap className="h-8 w-8 text-blue-600" />, title: "Automated Insights", description: "Get automated financial insights and recommendations" },
];

// How It Works Data
const howItWorksData = [
  { icon: <CreditCard className="h-8 w-8 text-blue-600" />, title: "1. Create Your Account", description: "Get started in minutes with our simple and secure sign-up process" },
  { icon: <BarChart3 className="h-8 w-8 text-blue-600" />, title: "2. Track Your Spending", description: "Automatically categorize and track your transactions in real-time" },
  { icon: <PieChart className="h-8 w-8 text-blue-600" />, title: "3. Get Insights", description: "Receive AI-powered insights and recommendations to optimize your finances" },
];

// Animation Variants
const fadeInUpVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const AnimatedCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: false });

  const { isSignedIn, user } = useUser();
  const { isLoaded } = useAuth(); // Add this
  const navigate = useNavigate();

  useEffect(() => {
      const checkAccountAndRedirect = async () => {
        try {
          const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/account/getaccount/${user?.id}`);
          // console.log(response);
          // console.log(user.id);
          const data = await response.json();
  
          if (data.length > 0) {
            navigate('/dashboard');
          } else {
            navigate('/dashboard/account');
          }
        } catch (error) {
          console.error('Error fetching budget data:', error);
        }
      };
  
      if (isLoaded && isSignedIn && user?.id) {
        checkAccountAndRedirect();
      }
    }, [isLoaded, isSignedIn, user, navigate]);

  useEffect(() => {
    if (inView) controls.start("visible");
    else controls.start("hidden");
  }, [controls, inView]);

  return (
    <motion.div
      ref={ref}
      variants={fadeInUpVariant}
      initial="hidden"
      animate={controls}
      transition={{ duration: 0.6 }}
    >
      <Card className="p-6 text-center">
        <div className="flex justify-center mb-4">{icon}</div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </Card>
    </motion.div>
  );
};

const Home = () => {
  return (
    <div className="min-h-screen bg-white">
  {/* Navbar */}
  <div className="flex justify-between items-center px-6 py-4 border-b shadow-sm">
    <img src="/logo.png" alt="Logo" width={160} height={50} />
    <div className="space-x-4">
      <SignedOut>
        <SignUpButton mode="modal">
          <Button variant="outline" className="transition-transform duration-300 hover:scale-105 hover:bg-blue-50">
            Sign Up
          </Button>
        </SignUpButton>
        <SignInButton mode="modal">
          <Button variant="customBlue" className="transition-transform duration-300 hover:scale-105 hover:brightness-110">
            Sign In
          </Button>
        </SignInButton>
      </SignedOut>
    </div>
  </div>

  {/* Hero Section */}
  <section className="pt-40 pb-20 px-4 text-center bg-gradient-to-r from-blue-50 to-white">
    <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold mb-6" style={{ background: 'linear-gradient(90deg, #3b82f6, #2563eb, #1e40af)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.03em', lineHeight: 1.1, textShadow: '0 2px 8px rgba(30,64,175,0.3)' }}>
      Empower Your Finances <br /> with AI
    </h1>
    <p className="text-xl max-w-3xl mx-auto text-gray-700 font-medium tracking-wide leading-relaxed mb-12 max-sm:px-2">
      An AI-powered financial management platform that helps you track, analyze, and optimize your spending with real-time insights.
    </p>
    <div className="flex justify-center space-x-6 mb-14">
      <SignInButton mode="modal">
        <Button size="lg" className="px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-indigo-700 hover:to-blue-600 text-white font-semibold shadow-lg transition-transform duration-300 hover:scale-105">
          Get Started
        </Button>
      </SignInButton>
    </div>
    <motion.img
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true, amount: 0.4 }}
      src="/hero.jpg"
      width={1280}
      height={720}
      alt="Dashboard Preview"
      className="rounded-lg shadow-2xl border mx-auto"
    />
  </section>

  {/* Features */}
  <section className="py-20 px-4">
    <h2 className="text-3xl font-bold text-center mb-12">Features That Make a Difference</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {featuresData.map((feature, index) => (
        <AnimatedCard key={index} {...feature} />
      ))}
    </div>
  </section>

  {/* How It Works */}
  <section className="py-20 px-4 bg-gray-50">
    <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {howItWorksData.map((step, index) => (
        <AnimatedCard key={index} {...step} />
      ))}
    </div>
  </section>

  {/* Testimonials */}
  <section className="py-20 px-4">
    <h2 className="text-3xl font-bold text-center mb-12">What Our Users Say</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
      {[
        { name: "Priya K.", role: "Freelancer", quote: "This app has transformed how I manage my money. The AI insights are spot-on!" },
        { name: "Rahul M.", role: "Startup Founder", quote: "Automated insights save me hours every week. Highly recommended." },
        { name: "Anjali S.", role: "Student", quote: "Easy to use and very intuitive. The receipt scanner is a game-changer." }
      ].map((testimonial, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: index * 0.1 }}
          viewport={{ once: true }}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <p className="text-gray-700 italic mb-4">"{testimonial.quote}"</p>
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
              {testimonial.name.charAt(0)}
            </div>
            <div className="ml-3">
              <p className="font-semibold">{testimonial.name}</p>
              <p className="text-sm text-gray-500">{testimonial.role}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </section>

  {/* CTA */}
  <section className="py-20 px-4 bg-gradient-to-r from-blue-50 to-white">
    <div className="max-w-4xl mx-auto text-center">
      <h2 className="text-3xl font-bold mb-6">Ready to Take Control of Your Finances?</h2>
      <p className="text-xl text-gray-700 mb-8">Join thousands of users who are already managing their money smarter with AI.</p>
      <Button size="lg" className="px-12 py-6 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-indigo-700 hover:to-blue-600 text-white font-semibold shadow-lg transition-transform duration-300 hover:scale-105">
        Get Started for Free
      </Button>
    </div>
  </section>

  {/* Footer */}
  <footer className="bg-blue-900 text-white py-10 px-6">
    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
      <div>
        <h3 className="text-xl font-semibold mb-3">AI Finance Tracker</h3>
        <p className="text-gray-300">Your intelligent partner for smarter financial decisions. Powered by cutting-edge AI.</p>
      </div>
      <div>
        <h4 className="text-lg font-semibold mb-2">Quick Links</h4>
        <ul className="space-y-1">
          <li><a href="#" className="hover:underline text-gray-300">Home</a></li>
          <li><a href="#" className="hover:underline text-gray-300">Features</a></li>
          <li><a href="#" className="hover:underline text-gray-300">How It Works</a></li>
        </ul>
      </div>
      <div>
        <h4 className="text-lg font-semibold mb-2">Connect</h4>
        <ul className="space-y-1">
          <li><a href="mailto:support@aifinance.com" className="hover:underline text-gray-300">support@aifinance.com</a></li>
          <li><a href="https://twitter.com" target="_blank" className="hover:underline text-gray-300">Twitter</a></li>
          <li><a href="https://linkedin.com" target="_blank" className="hover:underline text-gray-300">LinkedIn</a></li>
        </ul>
      </div>
    </div>
    <div className="text-center text-sm text-gray-400 mt-6 border-t border-gray-700 pt-4">
      &copy; {new Date().getFullYear()} AI Finance Tracker. All rights reserved.
    </div>
  </footer>
</div>

  );
};

export default Home;
