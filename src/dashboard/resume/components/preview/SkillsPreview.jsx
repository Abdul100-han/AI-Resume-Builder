import React from 'react'
import { filledSkills } from '@/lib/resume'

function SkillsPreview({ resumeInfo }) {
  const items = filledSkills(resumeInfo?.skills)
  if (!items.length) return null

  return (
    <div className='my-6'>
      <h2
        className='cv-section-title text-center font-bold text-sm mb-2'
        style={{ color: resumeInfo?.themeColor }}
      >
        Skills
      </h2>
      <hr style={{ borderColor: resumeInfo?.themeColor }} />

      <div className='grid grid-cols-2 gap-3 my-4'>
        {items.map((skill, index) => (
          <div key={index} className='cv-entry flex items-center justify-between'>
            <h2 className='text-xs'>{skill.name}</h2>
            {skill?.rating > 0 && (
              <div className='h-2 bg-gray-200 w-[120px]'>
                <div
                  className='h-2'
                  style={{
                    backgroundColor: resumeInfo?.themeColor,
                    width: skill.rating * 20 + '%',
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default SkillsPreview
