import React, { useEffect, useState } from 'react'
import AddResume from './components/AddResume'
import GlobalApi from './../../service/GlobalApi';
import ResumeCardItem from './components/ResumeCardItem';
import { getLocalUser } from '@/lib/localUser';

function Dashboard() {

  const user = getLocalUser();
  const [resumeList,setResumeList]=useState([]);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{
    GetResumesList()
  },[])

  /**
   * Used to Get Users Resume List
   */
  const GetResumesList=()=>{
    setLoading(true)
    GlobalApi.GetUserResumes(user.email)
    .then(resp=>{
      const list = resp?.data?.data
      setResumeList(Array.isArray(list) ? list : []);
    })
    .catch(()=>{
      setResumeList([]);
    })
    .finally(()=>{
      setLoading(false)
    })
  }
  return (
    <div className='p-10 md:px-20 lg:px-32'>
      <h2 className='font-bold text-3xl'>My Resume</h2>
      <p>Start Creating AI resume to your next Job role</p>
      <div className='grid grid-cols-2 
      md:grid-cols-3 lg:grid-cols-5 gap-5
      mt-10
      '>
        <AddResume/>
        {loading?
        [1,2,3,4].map((item,index)=>(
          <div key={index} className='h-[280px] rounded-lg bg-slate-200 animate-pulse'>
          </div>
        ))
        :resumeList.map((resume,index)=>(
          <ResumeCardItem resume={resume} key={index} refreshData={GetResumesList} />
        ))
        }
      </div>
    </div>
  )
}

export default Dashboard