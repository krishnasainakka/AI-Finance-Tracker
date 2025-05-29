import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
import EmojiPicker from 'emoji-picker-react';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion } from "framer-motion"

type CreateBudgetProps = {
  refreshData: () => void;
};

const CreateBudget: React.FC<CreateBudgetProps> = ({refreshData}) => {
  const { user } = useUser();
  const [emojiIcon, setEmojiIcon] = useState('😊');
  const [openEmojiPicker, setOpenEmojiPicker] = useState(false)

  const [name,setName] = useState<string>('');
  const [amount,setAmount] = useState<number>(0);

  const onCreateBudget = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/budget/addBudget`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',          
        },
        body: JSON.stringify({
          budgetname: name,
          amount: Number(amount),
          icon: emojiIcon,
          createdBy: user?.id
        }),
      });

      if(response.ok){
        refreshData()
        toast("New Budget Created!")
      }

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Error creating budget: ${errorData.message || 'Unknown error'}`);
        return;
      }      
    } catch (error) {
      alert('Failed to create budget. Please try again.');
      console.error(error);
    }
  };


  return (
  <div className="flex items-center justify-center h-full w-full max-w-sm mx-auto">
    <Dialog>
      <DialogTrigger>
        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="w-full"
        >
          <Card className="bg-blue-100 text-center w-full min-h-[180px] border border-slate-200 rounded-xl shadow-md hover:shadow-lg flex flex-col justify-center">
            <CardHeader className="flex justify-center items-center p-4">
              <CardTitle className="text-4xl font-bold text-black-600 leading-none">
                +
              </CardTitle>
            </CardHeader>

            <CardContent>              
              <div className="font-semibold text-black-800 text-lg">Create New Budget Card and start tracking</div>
            </CardContent>

            <CardFooter className="p-0" />
          </Card>
        </motion.div>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Budget</DialogTitle>
          <DialogDescription>
            <div className="mt-5 relative">
              {/* Wrapper relative for emoji picker */}
              <Button
                className="text-lg"
                variant="outline"
                onClick={() => setOpenEmojiPicker(!openEmojiPicker)}
              >
                {emojiIcon}
              </Button>
              {openEmojiPicker && (
                <div className="absolute z-10 top-full mt-2">
                  <EmojiPicker
                    open={openEmojiPicker}
                    onEmojiClick={(e) => {
                      setEmojiIcon(e.emoji);
                      setOpenEmojiPicker(false);
                    }}
                  />
                </div>
              )}

              <div className="mt-2">
                <h2 className="text-black font-medium my-1">Budget Name</h2>
                <Input placeholder="e.g. Home Decor" onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="mt-2">
                <h2 className="text-black font-medium my-1">Budget Amount</h2>
                <Input
                  placeholder="e.g. 10000Rs"
                  type="number"
                  onChange={(e) => setAmount(Number(e.target.value))}
                />
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button
              disabled={!(name && amount)}
              onClick={() => onCreateBudget()}
              variant="customBlue"
              className="mt-5 w-full"
            >
              Create Budget
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
);
}

export default CreateBudget;
