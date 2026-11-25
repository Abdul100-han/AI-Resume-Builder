import React from 'react'
import { filledProjects } from '@/lib/resume'

function ProjectsPreview({ resumeInfo }) {
  const items = filledProjects(resumeInfo?.projects)
  if (!items.length) return null

  const range = (start, end) => [start, end].filter(Boolean).join(' – ')

  return (
    <div className='my-6'>
      <h2
        className='cv-section-title text-center font-bold text-sm mb-2'
        style={{ color: resumeInfo?.themeColor }}
      >
        Projects
      </h2>
      <hr style={{ borderColor: resumeInfo?.themeColor }} />
      {items.map((item, index) => (
        <div key={index} className='cv-entry my-4'>
          <h2 className='text-sm font-bold flex justify-between gap-3' style={{ color: resumeInfo?.themeColor }}>
            <span>{item.name}</span>
            <span className='font-normal text-xs text-slate-600 shrink-0'>{range(item.startDate, item.endDate)}</span>
          </h2>
          {item.role && <p className='text-xs'>{item.role}</p>}
          {item.url && <p className='text-xs break-all'>{item.url}</p>}
          {item.description && <p className='text-xs my-1'>{item.description}</p>}
        </div>
      ))}
    </div>
  )
}

export default ProjectsPreview
