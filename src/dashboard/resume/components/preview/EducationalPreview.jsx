import React from 'react'
import { filledEducation } from '@/lib/resume'

function EducationalPreview({ resumeInfo }) {
  const items = filledEducation(resumeInfo?.education)
  if (!items.length) return null

  return (
    <div className='my-6'>
      <h2
        className='cv-section-title text-center font-bold text-sm mb-2'
        style={{ color: resumeInfo?.themeColor }}
      >
        Education
      </h2>
      <hr style={{ borderColor: resumeInfo?.themeColor }} />

      {items.map((education, index) => {
        const study = [education?.degree, education?.major].filter(Boolean).join(' in ')
        const dates = [education?.startDate, education?.endDate].filter(Boolean).join(' - ')
        return (
          <div key={index} className='cv-entry my-5'>
            <h2 className='text-sm font-bold' style={{ color: resumeInfo?.themeColor }}>
              {education.universityName}
            </h2>
            {(study || dates) && (
              <h2 className='text-xs flex justify-between gap-2'>
                <span>{study}</span>
                <span>{dates}</span>
              </h2>
            )}
            {education?.description && <p className='text-xs my-2'>{education.description}</p>}
          </div>
        )
      })}
    </div>
  )
}

export default EducationalPreview
