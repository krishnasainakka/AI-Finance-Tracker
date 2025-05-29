import { useState } from 'react';
import React from 'react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useUser} from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion } from "framer-motion"

type CreateAccountProps = {
  refreshAccounts: () => void;
};

const CreateAccount: React.FC<CreateAccountProps> = ({ refreshAccounts }) => {
  const { user } = useUser();

  const [accountName,setAccountName] = useState<string>('');
  const [balance,setBalance] = useState<number>(0);

  const onCreateAccount = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/account/addaccount`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',          
        },
        body: JSON.stringify({
          accountName,
          balance: Number(balance),
          createdBy: user?.id
        }),
      });

      if(response.ok){
        refreshAccounts()
        toast("New Account Created!")
      }

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Error creating budget: ${errorData.message || 'Unknown error'}`);
        return;
      }      
    } catch (error) {
      alert('Failed to create account. Please try again.');
      console.error(error);
    }
  };


  return (
    <div className="flex items-center justify-center h-full ">          

      <Dialog>
        <DialogTrigger>
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
                <div className="border border-dashed border-muted rounded-xl p-6 text-center shadow-md bg-gradient-to-r from-blue-50 to-blue-100">
                    <div className="flex flex-col items-center gap-4">
                      <div className="text-4xl">💳</div>
                      <h4 className="text-lg font-semibold">No Linked Accounts</h4>
                      <p className="text-sm text-muted-foreground">
                        Start by creating an account to manage your finances.
                      </p>
                      <Button variant="customBlue" >
                        + Create Account
                      </Button>
                    </div>
                </div>              
            </motion.div>

        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Account</DialogTitle>
            <DialogDescription>
              <div className='mt-5'>                                
                <div className='mt-2'>
                  <h2 className='text-black font-medium my-1'>Account Name</h2>
                  <Input placeholder='e.g. Krishna'
                  onChange={(e)=>setAccountName(e.target.value)}/>
                </div>
                <div className='mt-2'>
                  <h2 className='text-black font-medium my-1'>Initial Balance</h2>
                  <Input placeholder='e.g. 10000Rs'
                  type='number'
                  onChange={(e)=>setBalance(Number(e.target.value))}/>
                </div>                
              </div>
              
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-start">
            <DialogClose asChild>
              <Button 
                disabled={!(accountName&&balance)}
                onClick={()=> onCreateAccount()}
                variant='customBlue' className='mt-5 w-full'>Create Account</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>


    </div>
  );
};

export default CreateAccount;
