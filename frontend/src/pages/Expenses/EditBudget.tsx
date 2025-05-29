import { Button } from '@/components/ui/button'
import { PenBox } from 'lucide-react'
import { useUser } from '@clerk/clerk-react'
import { useEffect, useState } from 'react'

import React from 'react'
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

import EmojiPicker from 'emoji-picker-react'
import { Input } from '@/components/ui/input'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'

type BudgetInfo = {
  _id: string;
  budgetname: string;
  amount: number;
  icon: string;
  createdBy: string;
  // expensesThisMonth: Expense[];
  totalSpentThisMonth: number;
  expenseCountThisMonth: number;
};

interface EditBudgetProps {
  budgetInfo: BudgetInfo;
  refreshData: () => void;
}

const EditBudget: React.FC<EditBudgetProps> = ({ budgetInfo, refreshData }) => {
    const { user } = useUser();
    const { id } = useParams<{ id: string }>();
    const [emojiIcon, setEmojiIcon] = useState(budgetInfo?.icon);
    const [openEmojiPicker, setOpenEmojiPicker] = useState(false)

    const [name,setName] = useState<string>('');
    const [amount,setAmount] = useState<number>(0);

    useEffect(()=>{
        if(budgetInfo){
            setName(budgetInfo?.budgetname);
            setAmount(budgetInfo?.amount)
            setEmojiIcon(budgetInfo?.icon);
        }
    },[budgetInfo])

    const onUpdateBudget = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/budget/updateBudget/${user.id}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    budgetname: name,
                    amount,
                    icon: emojiIcon,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                toast.success('Budget updated successfully!');
                refreshData(); // if you have a function to reload budget data
            } 
            else {
                toast.error(`Update failed: ${data.message}`);
            }
        } 
        catch (error) {
            console.error('Update error:', error);
            toast.error('Something went wrong while updating.');
        }
    };


  return (
    <div>
      <Dialog>
        <DialogTrigger>
            <Button className='flex gap-2'> <PenBox/>Edit</Button>          
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Budget</DialogTitle>
            <DialogDescription>
              <div className='mt-5'>
                <Button className='text-lg' variant='outline'
                  onClick={()=>setOpenEmojiPicker(!openEmojiPicker)}>
                  {emojiIcon}
                </Button>
                <div className='absolute z-10'>
                  <EmojiPicker 
                    open={openEmojiPicker} 
                    onEmojiClick={(e)=>{
                      setEmojiIcon(e.emoji)
                      setOpenEmojiPicker(false)}}/>
                </div>
                <div className='mt-2'>
                  <h2 className='text-black font-medium my-1'>Budget Name</h2>
                  <Input placeholder='e.g. Home Decor'
                  defaultValue={budgetInfo?.budgetname}
                  onChange={(e)=>setName(e.target.value)}/>
                </div>
                <div className='mt-2'>
                  <h2 className='text-black font-medium my-1'>Budget Amount</h2>
                  <Input placeholder='e.g. 10000Rs'
                  type='number'
                  defaultValue={budgetInfo?.amount}
                  onChange={(e)=>setAmount(Number(e.target.value))}/>
                </div>                
              </div>
              
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-start">
            <DialogClose asChild>
              <Button 
                disabled={!(name&&amount)}
                onClick={()=> onUpdateBudget()}
                variant='customBlue' className='mt-5 w-full'>Update Budget</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default EditBudget
