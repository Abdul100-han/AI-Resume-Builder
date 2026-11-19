import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import FormSection from '../../components/FormSection';
import ResumePreview from '../../components/ResumePreview';
import { ResumeInfoContext } from '@/context/ResumeInfoContext';
import BackendApi from './../../../../../service/BackendApi';
import { normalizeResume } from '@/lib/resume';
import { toast } from 'sonner';

function EditResume() {
    const {resumeId}=useParams();
    const [resumeInfo,setResumeInfo]=useState();
    useEffect(()=>{
       
        GetResumeInfo();
    },[])


    const GetResumeInfo=()=>{
        BackendApi.getResumeById(resumeId).then(resp=>{
          setResumeInfo(normalizeResume(resp.data));
        }).catch(()=>{
          toast('Could not load this resume.')
        })
    }

  return (
    <ResumeInfoContext.Provider value={{resumeInfo,setResumeInfo}}>
    <div className='grid grid-cols-1 md:grid-cols-2 p-10 gap-10'>
        {/* Form Section  */}
          <FormSection key={resumeInfo?._id || 'loading'} />
        {/* Preview Section  */}
         <ResumePreview/>
    </div>
    </ResumeInfoContext.Provider>
  )
}

export default EditResume