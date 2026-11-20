import { Loader2, PlusSquare } from 'lucide-react'
import React, { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import BackendApi from './../../../service/BackendApi'
import { useNavigate } from 'react-router-dom'
import { getLocalUser } from '@/lib/localUser'
import { toast } from 'sonner'



function AddResume() {

    const [openDialog,setOpenDialog]=useState(false)
    const [resumeTitle,setResumeTitle]=useState();
    const user = getLocalUser();
    const [loading,setLoading]=useState(false);
    const navigation=useNavigate();
    const onCreate=async()=>{
        setLoading(true)
        BackendApi.createResume({
            title: resumeTitle,
            email: user.email,
            name: user.name,
        }).then(resp=>{
            setLoading(false);
            navigation('/dashboard/resume/'+resp.data.id+"/edit");
        },()=>{
            setLoading(false);
            toast('Could not create the resume. Check that the API server is running and Supabase is configured, then try again.')
        })

    }
  return (
    <div >
        <div className='p-14 py-24 border 
        items-center flex 
        justify-center bg-secondary
        rounded-lg h-[280px]
        hover:scale-105 transition-all hover:shadow-md
        cursor-pointer border-dashed'
        onClick={()=>setOpenDialog(true)}
        >
            <PlusSquare  />
        </div>

        <Dialog open={openDialog}>
       
        <DialogContent>
            <DialogHeader>
            <DialogTitle>Create New Resume</DialogTitle>
            <DialogDescription>
                <p>Add a title for your new resume</p>
                <Input className="my-2" 
                placeholder="Ex.Full Stack resume"
                onChange={(e)=>setResumeTitle(e.target.value)}
                />
            </DialogDescription>
            <div className='flex justify-end gap-5'>
                <Button onClick={()=>setOpenDialog(false)} variant="ghost">Cancel</Button>
                <Button 
                    disabled={!resumeTitle||loading}
                onClick={()=>onCreate()}>
                    {loading?
                    <Loader2 className='animate-spin' /> :'Create'   
                }
                    </Button>
            </div>
            </DialogHeader>
        </DialogContent>
        </Dialog>

    </div>
  )
}

export default AddResume