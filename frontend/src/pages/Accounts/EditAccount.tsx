import React, { useEffect, useState } from 'react';

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
import { PenBox } from 'lucide-react';


interface Account {
  _id: string;
  accountName: string;
  balance: number;
}
type EditAccountProps = {
  accountInfo: Account;
  refreshAccounts: () => void;
};



const EditAccount: React.FC<EditAccountProps>= ({accountInfo, refreshAccounts}) => {
  const { user } = useUser();

  const [accountName,setAccountName] = useState<string>('');
  const [balance,setBalance] = useState<number>(0);

  useEffect(()=>{
    if(accountInfo){
        setAccountName(accountInfo?.accountName);
        setBalance(accountInfo?.balance);
    }
  },[accountInfo])

  const onUpdateAccount = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/account/updateaccount/${accountInfo._id}`, {
        method: 'PUT',
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
        toast("Account Updated!")
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
            <Button variant={'customBlue'} className='flex gap-5 absolute right-1 top-20'> <PenBox/>Edit</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Account</DialogTitle>
            <DialogDescription>
              <div className='mt-5'>                                
                <div className='mt-2'>
                  <h2 className='text-black font-medium my-1'>Account Name</h2>
                  <Input placeholder='e.g. Krishna'
                  defaultValue={accountInfo?.accountName}
                  onChange={(e)=>setAccountName(e.target.value)}/>
                </div>
                <div className='mt-2'>
                  <h2 className='text-black font-medium my-1'>Initial Balance</h2>
                  <Input placeholder='e.g. 10000Rs'
                  type='number'
                  defaultValue={accountInfo?.balance}
                  onChange={(e)=>setBalance(Number(e.target.value))}/>
                </div>                
              </div>
              
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-start">
            <DialogClose asChild>
              <Button 
                disabled={!(accountName&&balance)}
                onClick={()=> onUpdateAccount()}
                variant='customBlue' className='mt-5 w-full'>Update Account</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>


    </div>
  );
};

export default EditAccount;
