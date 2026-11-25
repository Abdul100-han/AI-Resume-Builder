import React from 'react'

function SummeryPreview({ resumeInfo }) {
  const text = String(resumeInfo?.summery || '').trim()
  if (!text) return null

  return (
    <div className='my-6'>
      <h2
        className='cv-section-title text-center font-bold text-sm mb-2'
        style={{ color: resumeInfo?.themeColor }}
      >
        Professional Summary
      </h2>
      <hr style={{ borderColor: resumeInfo?.themeColor }} />
      <p className='text-xs my-2'>{text}</p>
    </div>
  )
}

export default SummeryPreview
