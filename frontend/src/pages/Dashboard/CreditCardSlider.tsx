import React, { useEffect, useContext} from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Eye, Pencil, Trash } from "lucide-react";
import { useNavigate } from 'react-router-dom';

import { useCardAnimation } from "../../hooks/useCardAnimation";
import { toast } from "sonner";

import BudgetContext from '@/context/BudgetContext';
import EditAccount from "../Accounts/EditAccount";

interface Account {
  _id: string;
  accountName: string;
  balance: number; 
  createdBy: string;
  createdAt?: string; 
}

interface CreditCardSliderProps {
  accountsData: Account[];
  selectedAccountId: string;
  onAccountChange: (accountId: string) => void;
}

const colorPalette = [
  "bg-gradient-to-br from-purple-600 to-blue-500",
  "bg-gradient-to-br from-amber-500 to-pink-500",
  "bg-gradient-to-br from-emerald-500 to-cyan-600",
  "bg-gradient-to-br from-indigo-500 to-fuchsia-600",
  "bg-gradient-to-br from-rose-500 to-red-500",
];

const getColorForAccount = (_id: string): string => {
  let hash = 0;
  for (let i = 0; i < _id.length; i++) {
    hash = _id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colorPalette.length;
  return colorPalette[index];
};

const CreditCardSlider: React.FC<CreditCardSliderProps> = ({
  accountsData,
  selectedAccountId,
  onAccountChange,
}) => {
  const { cardsRef, currentIndex, next, previous } = useCardAnimation(
    accountsData.findIndex((a) => a._id === selectedAccountId) || 0,
    accountsData.length
  );

  useEffect(() => {
    if (accountsData.length > 0 && accountsData[currentIndex]) {
      onAccountChange(accountsData[currentIndex]._id);
    }
  }, [currentIndex, accountsData, onAccountChange]);


  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const navigate = useNavigate();
  const ctx = useContext(BudgetContext);

  if (!ctx) return <div>Loading...</div>;

  const { refreshAccounts } = ctx;

  const handleDelete = async (accountId: string) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/account/deleteaccount/${accountId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Account deleted");
        refreshAccounts()
        // navigate('/dashboard/accounts')
      } else {
        const errorData = await res.json();
        toast.error(`Failed to delete account: ${errorData.message}`);
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Something went wrong while deleting.");
    }
  };


  return (
    <div className="relative w-full">
      {/* Card Display */}
      <div className="relative h-56 w-full overflow-hidden">
        <div ref={cardsRef} className="relative h-full w-full">
          {accountsData.map((account, idx) => {
            return (
              <div
                key={account._id}
                className={`absolute inset-0 rounded-xl p-5 shadow-lg transition-all duration-500 ease-in-out
                  ${getColorForAccount(account._id)}
                  backdrop-blur-sm backdrop-filter
                  before:absolute before:inset-0 before:rounded-xl before:bg-white/5 before:opacity-30`}
                style={{
                  transform: `translateX(${(idx - currentIndex) * 8}px)
                              translateY(${(idx - currentIndex) * 8}px)
                              scale(${idx === currentIndex ? 1 : 0.95})`,
                  zIndex: accountsData.length - Math.abs(currentIndex - idx),
                  opacity: Math.abs(currentIndex - idx) > 2 ? 0 : 1,
                }}
              >
                <div className="flex h-full flex-col justify-between text-white relative z-10">

                  {/* Delete Button Top-Right */}
                  <Button
                    variant="destructive"
                    className="absolute top-3 right-2 flex items-center gap-1 bg-red-600/80 hover:bg-red-700 text-white text-sm px-3 py-1  z-20"
                    onClick={() => handleDelete(account._id)}
                  >
                    <Trash className="h-4 w-4" />
                    Delete
                  </Button>

                  <EditAccount accountInfo={account} refreshAccounts={refreshAccounts}/>

                  {/* Top Row */}
                  <div className="absolute  flex justify-between items-start">
                    <div >
                      <p className="text-xs font-light opacity-80">Account</p>
                      <p className="font-medium">Fin Genius</p>
                    </div>
                  </div>

                  {/* Chip */}
                  <div className="absolute top-12 left-2 h-7 w-10 rounded-md bg-yellow-500 bg-opacity-80 shadow-inner overflow-hidden">
                    <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-br from-yellow-300 to-yellow-600 opacity-40">
                      <div className="grid grid-cols-4 grid-rows-3 h-full w-full">
                        {[...Array(12)].map((_, i) => (
                          <div key={i} className="border-b border-r border-yellow-700 border-opacity-30"></div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="mb-1 mt-4">
                      <p className="text-xs font-light opacity-80">Account Name</p>
                      <p className="font-medium tracking-wider">{account.accountName}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs font-light opacity-80">Balance</p>
                        <p className="text-xl font-bold">
                          {formatCurrency(account.balance)}
                        </p>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="mt-2 right-2 gap-4 bg-white/20 text-white hover:bg-white/30"
                        onClick={() => navigate('/dashboard/accounts')}
                      >
                        <Eye className="mr-1 h-3 w-3" />
                        View
                      </Button>
                    </div>
                  </div>

                  {/* Hologram */}
                  <div className="absolute bottom-3 right-3 h-6 w-6 rounded-full bg-white/20 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-[shimmer_2s_infinite] opacity-30"></div>
                  </div>

                </div>
              </div>
            );
          })}

        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="mt-4 flex justify-between">
        <Button
          variant="outline"
          size="icon"
          onClick={previous}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={next}
          disabled={currentIndex === accountsData.length - 1}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default CreditCardSlider;
