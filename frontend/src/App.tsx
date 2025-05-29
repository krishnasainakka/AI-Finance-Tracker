import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SignedIn, SignedOut } from "@clerk/clerk-react";

import Dashboard from './pages/Dashboard/Dashboard';
import Budget from './pages/Budget/Budget';
import Layout from "./pages/Layout";
import Expense from './pages/Expenses/Expense';
import { BudgetProvider } from "./context/BudgetState";
import Accounts from "./pages/Accounts/Accounts";
import Income from "./pages/Income/Income";
import ChatCoach from "./pages/ChatCoach";
import Home from "./pages/Home";

function App() {
  return (
    <BudgetProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Page */}
          <Route path="/" element={<Home />} />

          {/* Private routes only if Signed In */}
          <Route
            path="/dashboard"
            element={
              <SignedIn>
                <Layout>
                  <Dashboard />
                </Layout>
              </SignedIn>
            }
          />

          <Route
            path="/dashboard/budget"
            element={
              <SignedIn>
                <Layout>
                  <Budget />
                </Layout>
              </SignedIn>
            }
          />

          <Route
            path="/dashboard/expenses/:id"
            element={
              <SignedIn>
                
                  <Layout>
                    <Expense />
                  </Layout>
              </SignedIn>
            }
          />

          <Route
            path="/dashboard/incomes"
            element={
              <SignedIn>
                <Layout>
                  <Income/>
                </Layout>
              </SignedIn>
            }
          />          

          <Route
            path="/dashboard/accounts"
            element={
              <SignedIn>
                <Layout>
                  <Accounts/>
                </Layout>
              </SignedIn>
            }
          />

          <Route
            path="/dashboard/chatbot"
            element={
              <SignedIn>
                <Layout>
                  <ChatCoach/>
                </Layout>
              </SignedIn>
            }
          />

          {/* Optional: redirect or show nothing for signed out users */}
          <Route
            path="/"
            element={
              <SignedOut>
                <Home />
              </SignedOut>
            }
          />
          
        </Routes>
      </BrowserRouter>
    </BudgetProvider>
  );
}

export default App;
