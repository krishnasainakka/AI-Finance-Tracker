import { useEffect } from 'react';
import { LayoutGrid, PiggyBank, ReceiptText } from 'lucide-react';
import { UserButton } from '@clerk/clerk-react';
import { Link, useLocation } from 'react-router-dom';

const SideNavbar = () => {
  const menuList = [
    { id: 1, name: 'Dashboard', icon: LayoutGrid, path: '/dashboard' },
    { id: 2, name: 'Budget & Expenses', icon: PiggyBank, path: '/dashboard/budget' },
    { id: 3, name: 'Incomes', icon: ReceiptText, path: '/dashboard/incomes' },
    { id: 4, name: 'Accounts', icon: ReceiptText, path: '/dashboard/accounts' },
    { id: 5, name: 'Finance Chatbot', icon: ReceiptText, path: '/dashboard/chatbot' },
  ];

  const location = useLocation();

  useEffect(() => {
    console.log(location.pathname);
  }, []);

  return (
    <div className="h-full md:h-screen p-5 border shadow-sm overflow-y-auto bg-white">
      <div>
        <img src="/logo.png" alt="Logo" width={160} height={100} />
        <div className="mt-5 space-y-1">
          {menuList.map((menu) => (
            <Link to={menu.path} key={menu.id}>
              <h2
                className={`flex gap-2 items-center text-gray-700 font-medium p-3 rounded-md hover:text-primary hover:bg-blue-100
                ${location.pathname === menu.path && 'text-primary bg-blue-100'}`}
              >
                <menu.icon size={18} />
                {menu.name}
              </h2>
            </Link>
          ))}
        </div>
      </div>

      <div className="p-3 flex gap-2 items-center border-t mt-4">
        <UserButton />
        <span className="text-sm font-medium">Profile</span>
      </div>
    </div>
  );
};

export default SideNavbar;
