import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AddResume from './components/AddResume'
import BackendApi from './../../service/BackendApi';
import ResumeCardItem from './components/ResumeCardItem';
import { getLocalUser } from '@/lib/localUser';
import { Button } from '@/components/ui/button';

function Dashboard() {

  const user = getLocalUser();
  const [resumeList,setResumeList]=useState([]);
  const [profile,setProfile]=useState(null);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{
    GetResumesList()
    BackendApi.getProfile(user.email)
      .then((resp)=>setProfile(resp.data.studentProfile))
      .catch(()=>setProfile(null))
  },[])

  /**
   * Used to Get Users Resume List
   */
  const GetResumesList=()=>{
    setLoading(true)
    BackendApi.getResumes(user.email)
    .then(resp=>{
      const list = resp?.data
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
      <div className='mt-6 flex flex-col gap-3 rounded-lg border p-5 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <p className='text-sm font-semibold text-primary'>{profile?.institution || 'Kano State Polytechnic'}</p>
          {profile?.department ? (
            <p className='mt-1 text-sm text-gray-600'>
              {profile.fullName || user.name} · {profile.department}
              {profile.academicStatus ? ` · ${profile.academicStatus}` : ''}
              {profile.graduationYear ? ` · ${profile.graduationYear}` : ''}
            </p>
          ) : (
            <p className='mt-1 text-sm text-gray-600'>Add your department, status, and skills so new CVs start with your polytechnic details.</p>
          )}
        </div>
        <Link to='/profile'><Button variant='outline'>Student Profile</Button></Link>
      </div>
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