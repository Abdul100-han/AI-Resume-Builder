import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ResumeInfoContext } from '@/context/ResumeInfoContext'
import { LoaderCircle } from 'lucide-react'
import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import BackendApi from './../../../../../service/BackendApi'
import { getLocalUser } from '@/lib/localUser'
import { toast } from 'sonner'

const blank = () => ({ name: '', issuer: '', date: '', credentialId: '' })

function Certifications() {
  const { resumeInfo, setResumeInfo } = useContext(ResumeInfoContext)
  const params = useParams()
  const [loading, setLoading] = useState(false)
  const [list, setList] = useState(() => {
    const existing = resumeInfo?.certifications ?? []
    return existing.length > 0 ? existing : [blank()]
  })

  const handleChange = (event, index) => {
    const next = list.slice()
    next[index][event.target.name] = event.target.value
    setList(next)
  }

  useEffect(() => {
    setResumeInfo({ ...resumeInfo, certifications: list ?? [] })
  }, [list])

  const onSave = () => {
    setLoading(true)
    BackendApi.updateResume(params.resumeId, { certifications: list }, getLocalUser().email).then(() => {
      setLoading(false)
      toast('Details updated !')
    }, () => {
      setLoading(false)
      toast('Server Error, Please try again!')
    })
  }

  return (
    <div className='p-5 shadow-lg rounded-lg border-t-primary border-t-4 mt-10'>
      <h2 className='font-bold text-lg'>Certifications</h2>
      <p>Add certificates, licenses, or short courses. Skip this step if you have none.</p>
      <div>
        {(list ?? []).map((item, index) => (
          <div key={index} className='grid grid-cols-2 gap-3 border p-3 my-5 rounded-lg'>
            <div className='col-span-2'>
              <label>Certificate name</label>
              <Input name='name' value={item?.name || ''} onChange={(e) => handleChange(e, index)} />
            </div>
            <div>
              <label>Issuer</label>
              <Input name='issuer' value={item?.issuer || ''} onChange={(e) => handleChange(e, index)} />
            </div>
            <div>
              <label>Date</label>
              <Input type='date' name='date' value={item?.date || ''} onChange={(e) => handleChange(e, index)} />
            </div>
            <div className='col-span-2'>
              <label>Credential ID or URL (optional)</label>
              <Input name='credentialId' value={item?.credentialId || ''} onChange={(e) => handleChange(e, index)} />
            </div>
          </div>
        ))}
      </div>
      <div className='flex justify-between'>
        <div className='flex gap-2'>
          <Button variant='outline' onClick={() => setList([...list, blank()])} className='text-primary'>+ Add More Certification</Button>
          <Button variant='outline' onClick={() => setList((current) => current.slice(0, -1))} className='text-primary'>- Remove</Button>
        </div>
        <Button disabled={loading} onClick={onSave}>
          {loading ? <LoaderCircle className='animate-spin' /> : 'Save'}
        </Button>
      </div>
    </div>
  )
}

export default Certifications
