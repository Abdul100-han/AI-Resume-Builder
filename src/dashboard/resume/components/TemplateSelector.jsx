/* eslint-disable react/prop-types */
import { useContext } from 'react'
import { useParams } from 'react-router-dom'
import { LayoutTemplate } from 'lucide-react'
import { toast } from 'sonner'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { ResumeInfoContext } from '@/context/ResumeInfoContext'
import { getLocalUser } from '@/lib/localUser'
import BackendApi from './../../../../service/BackendApi'
import { TEMPLATES, templateId } from './templates/templates'

// Tiny schematic so the two layouts are recognisable at a glance.
function Thumbnail({ id }) {
  if (id === 'modern') {
    return (
      <div className='h-16 w-12 shrink-0 rounded border bg-white overflow-hidden'>
        <div className='h-2.5 bg-slate-500' />
        <div className='flex h-full'>
          <div className='w-1/3 bg-slate-200' />
          <div className='flex-1 p-1 space-y-1'>
            <div className='h-0.5 bg-slate-300' /><div className='h-0.5 bg-slate-300' /><div className='h-0.5 w-2/3 bg-slate-300' />
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className='h-16 w-12 shrink-0 rounded border border-t-4 border-t-slate-500 bg-white p-1 space-y-1'>
      <div className='mx-auto h-1 w-2/3 bg-slate-400' />
      <div className='h-0.5 bg-slate-300' /><div className='h-0.5 bg-slate-300' />
      <div className='h-0.5 bg-slate-300' /><div className='h-0.5 w-2/3 bg-slate-300' />
    </div>
  )
}

function TemplateSelector({ persist = true }) {
  const { resumeInfo, setResumeInfo } = useContext(ResumeInfoContext)
  const { resumeId } = useParams()
  const current = templateId(resumeInfo?.template)

  const onSelect = (id) => {
    if (id === current) return
    setResumeInfo({ ...resumeInfo, template: id })
    if (!persist) return
    BackendApi.updateResume(resumeId, { template: id }, getLocalUser().email).then(
      () => toast('Template updated'),
      () => toast('Template applied here, but only the CV owner can save it.')
    )
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='outline' size='sm' className='flex gap-2'>
          <LayoutTemplate /> Template
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-80'>
        <h2 className='mb-3 text-sm font-bold'>Choose a CV template</h2>
        <div className='space-y-2'>
          {TEMPLATES.map((template) => (
            <button
              key={template.id}
              type='button'
              onClick={() => onSelect(template.id)}
              className={`flex w-full gap-3 rounded-md border p-2 text-left transition hover:bg-slate-50 ${
                current === template.id ? 'border-primary ring-1 ring-primary' : ''
              }`}
            >
              <Thumbnail id={template.id} />
              <span>
                <span className='block text-sm font-semibold'>{template.name}</span>
                <span className='block text-xs text-gray-500'>{template.description}</span>
              </span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default TemplateSelector
