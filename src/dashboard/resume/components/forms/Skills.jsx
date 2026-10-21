import { Input } from '@/components/ui/input'
import React, { useContext, useEffect, useState } from 'react'
import { Rating } from '@smastrom/react-rating'

import '@smastrom/react-rating/style.css'
import { Button } from '@/components/ui/button'
import { LoaderCircle } from 'lucide-react'
import { ResumeInfoContext } from '@/context/ResumeInfoContext'
import GlobalApi from './../../../../../service/GlobalApi'
import BackendApi from './../../../../../service/BackendApi'
import { getLocalUser } from '@/lib/localUser'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'
function Skills() {

    const [skillsList,setSkillsList]=useState([{
        name:'',
        rating:0
    }])
    const {resumeId}=useParams();

    const [loading,setLoading]=useState(false);
    const {resumeInfo,setResumeInfo}=useContext(ResumeInfoContext);
   
    useEffect(()=>{
        resumeInfo&&setSkillsList(resumeInfo?.skills)
      },[])
   
    const handleChange=(index,name,value)=>{
        const newEntries=skillsList.slice();
      
        newEntries[index][name]=value;
        setSkillsList(newEntries);
    }

    const AddNewSkills=()=>{
        setSkillsList([...skillsList,{
            name:'',
        rating:0 
        }])
    }
    const RemoveSkills=()=>{
        setSkillsList(skillsList=>skillsList.slice(0,-1))
    }

    const onSave=()=>{

        setLoading(true);
        const skills = skillsList.map(({ id, ...rest }) => rest)
        const data={
            data:{
                skills
            }
        }

        const user = getLocalUser()
        const saveStrapi = GlobalApi.UpdateResumeDetail(resumeId, data)
        const saveMatchProfile = BackendApi.syncResume({
            email: user.email,
            name: user.name,
            resumeId,
            title: resumeInfo?.title || 'My Resume',
            themeColor: resumeInfo?.themeColor,
            firstName: resumeInfo?.firstName,
            lastName: resumeInfo?.lastName,
            jobTitle: resumeInfo?.jobTitle,
            address: resumeInfo?.address,
            phone: resumeInfo?.phone,
            contactEmail: resumeInfo?.email,
            summery: resumeInfo?.summery,
            experience: resumeInfo?.Experience || resumeInfo?.experience || [],
            education: resumeInfo?.education || [],
            skills,
        }).catch(() => null)

        Promise.allSettled([saveStrapi, saveMatchProfile]).then((results) => {
            setLoading(false)
            if (results[0].status === 'fulfilled' || results[1].value) {
                toast('Details updated !')
            } else {
                toast('Server Error, Try again!')
            }
        })
    }

    useEffect(()=>{
        setResumeInfo({
            ...resumeInfo,
            skills:skillsList
        })
    },[skillsList])
  return (
    <div className='p-5 shadow-lg rounded-lg border-t-primary border-t-4 mt-10'>
    <h2 className='font-bold text-lg'>Skills</h2>
    <p>Add Your top professional key skills</p>

    <div>
        {skillsList.map((item,index)=>(
            <div className='flex justify-between mb-2 border rounded-lg p-3 '>
                <div>
                    <label className='text-xs'>Name</label>
                    <Input className="w-full"
                    defaultValue={item.name}
                    onChange={(e)=>handleChange(index,'name',e.target.value)} />
                </div>
                <Rating style={{ maxWidth: 120 }} value={item.rating} 
                onChange={(v)=>handleChange(index,'rating',v)}/>

            </div>
        ))}
    </div>
    <div className='flex justify-between'>
            <div className='flex gap-2'>
            <Button variant="outline" onClick={AddNewSkills} className="text-primary"> + Add More Skill</Button>
            <Button variant="outline" onClick={RemoveSkills} className="text-primary"> - Remove</Button>

            </div>
            <Button disabled={loading} onClick={()=>onSave()}>
            {loading?<LoaderCircle className='animate-spin' />:'Save'}    
            </Button>
        </div>
    </div>
  )
}

export default Skills