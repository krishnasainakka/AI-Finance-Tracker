import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { LayoutGrid, PiggyBank, ReceiptText } from 'lucide-react';
import { UserButton } from '@clerk/clerk-react';
import { Link, useLocation } from 'react-router-dom';

interface SideNavbarMobileProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const SideNavbarMobile: React.FC<SideNavbarMobileProps> = ({ open, setOpen }) => {
  const menuList = [
    { id: 1, name: 'Dashboard', icon: LayoutGrid, path: '/dashboard' },
    { id: 2, name: 'Budget & Expenses', icon: PiggyBank, path: '/dashboard/budget' },
    { id: 3, name: 'Incomes', icon: ReceiptText, path: '/dashboard/incomes' },
    { id: 4, name: 'Accounts', icon: ReceiptText, path: '/dashboard/accounts' },
    { id: 5, name: 'Finance Chatbot', icon: ReceiptText, path: '/dashboard/chatbot' },
  ];

  const location = useLocation();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="p-0 m-0 h-screen w-screen max-w-none rounded-none border-none shadow-none"
        onPointerDownOutside={() => setOpen(false)}
      >
        <div
          className="h-full bg-white flex flex-col justify-between"
          onClick={() => setOpen(false)} // ✅ closes when clicking anywhere
        >
          <div className="p-4">
            <img src="/logo.png" alt="Logo" width={160} />
            <div className="mt-4 space-y-2">
              {menuList.map((menu) => (
                <Link key={menu.id} to={menu.path}>
                  <div
                    className={`flex items-center gap-3 p-3 rounded-md text-sm cursor-pointer
                    ${location.pathname === menu.path ? 'bg-blue-100 text-primary' : 'text-gray-600 hover:bg-blue-50'}
                  `}
                  >
                    <menu.icon size={18} />
                    {menu.name}
                  </div>
                </Link>
              ))}
            </div>
          </div>
          <div className="p-4 border-t flex items-center gap-2">
            <UserButton />
            <span className="text-sm">Profile</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SideNavbarMobile;
