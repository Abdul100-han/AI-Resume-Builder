import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ResumeInfoContext } from '@/context/ResumeInfoContext'
import { LoaderCircle } from 'lucide-react'
import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import BackendApi from './../../../../../service/BackendApi'
import { getLocalUser } from '@/lib/localUser'
import { toast } from 'sonner'

const blank = () => ({ name: '', role: '', startDate: '', endDate: '', url: '', description: '' })

function Projects() {
  const { resumeInfo, setResumeInfo } = useContext(ResumeInfoContext)
  const params = useParams()
  const [loading, setLoading] = useState(false)
  const [list, setList] = useState(() => {
    const existing = resumeInfo?.projects ?? []
    return existing.length > 0 ? existing : [blank()]
  })

  const handleChange = (event, index) => {
    const next = list.slice()
    next[index][event.target.name] = event.target.value
    setList(next)
  }

  useEffect(() => {
    setResumeInfo({ ...resumeInfo, projects: list ?? [] })
  }, [list])

  const onSave = () => {
    setLoading(true)
    BackendApi.updateResume(params.resumeId, { projects: list }, getLocalUser().email).then(() => {
      setLoading(false)
      toast('Details updated !')
    }, () => {
      setLoading(false)
      toast('Server Error, Please try again!')
    })
  }

  return (
    <div className='p-5 shadow-lg rounded-lg border-t-primary border-t-4 mt-10'>
      <h2 className='font-bold text-lg'>Projects</h2>
      <p>Add academic, SIWES, or personal projects. Skip this step if you have none.</p>
      <div>
        {(list ?? []).map((item, index) => (
          <div key={index} className='grid grid-cols-2 gap-3 border p-3 my-5 rounded-lg'>
            <div className='col-span-2'>
              <label>Project name</label>
              <Input name='name' value={item?.name || ''} onChange={(e) => handleChange(e, index)} />
            </div>
            <div>
              <label>Your role</label>
              <Input name='role' value={item?.role || ''} onChange={(e) => handleChange(e, index)} />
            </div>
            <div>
              <label>Link (optional)</label>
              <Input name='url' value={item?.url || ''} onChange={(e) => handleChange(e, index)} />
            </div>
            <div>
              <label>Start Date</label>
              <Input type='date' name='startDate' value={item?.startDate || ''} onChange={(e) => handleChange(e, index)} />
            </div>
            <div>
              <label>End Date</label>
              <Input type='date' name='endDate' value={item?.endDate || ''} onChange={(e) => handleChange(e, index)} />
            </div>
            <div className='col-span-2'>
              <label>Description</label>
              <Textarea name='description' value={item?.description || ''} onChange={(e) => handleChange(e, index)} />
            </div>
          </div>
        ))}
      </div>
      <div className='flex justify-between'>
        <div className='flex gap-2'>
          <Button variant='outline' onClick={() => setList([...list, blank()])} className='text-primary'>+ Add More Project</Button>
          <Button variant='outline' onClick={() => setList((current) => current.slice(0, -1))} className='text-primary'>- Remove</Button>
        </div>
        <Button disabled={loading} onClick={onSave}>
          {loading ? <LoaderCircle className='animate-spin' /> : 'Save'}
        </Button>
      </div>
    </div>
  )
}

export default Projects
