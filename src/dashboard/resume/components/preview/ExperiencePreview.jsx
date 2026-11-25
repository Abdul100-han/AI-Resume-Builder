import React from 'react'
import { filledExperience } from '@/lib/resume'

function ExperiencePreview({ resumeInfo }) {
  const items = filledExperience(resumeInfo?.experience)
  if (!items.length) return null

  return (
    <div className='my-6'>
      <h2
        className='cv-section-title text-center font-bold text-sm mb-2'
        style={{ color: resumeInfo?.themeColor }}
      >
        Professional Experience
      </h2>
      <hr style={{ borderColor: resumeInfo?.themeColor }} />

      {items.map((experience, index) => {
        const place = [experience?.companyName, experience?.city, experience?.state].filter(Boolean).join(', ')
        const dates = [experience?.startDate, experience?.currentlyWorking ? 'Present' : experience?.endDate]
          .filter(Boolean)
          .join(' To ')
        return (
          <div key={index} className='cv-entry my-5'>
            <h2 className='text-sm font-bold' style={{ color: resumeInfo?.themeColor }}>{experience?.title}</h2>
            {(place || dates) && (
              <h2 className='text-xs flex justify-between gap-2'>
                <span>{place}</span>
                <span>{dates}</span>
              </h2>
            )}
            {experience?.workSummery && (
              <div className='cv-rich text-xs my-2' dangerouslySetInnerHTML={{ __html: experience.workSummery }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default ExperiencePreview
