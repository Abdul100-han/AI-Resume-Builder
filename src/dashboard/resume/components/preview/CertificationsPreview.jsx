import React from 'react'
import { filledCertifications } from '@/lib/resume'

function CertificationsPreview({ resumeInfo }) {
  const items = filledCertifications(resumeInfo?.certifications)
  if (!items.length) return null

  return (
    <div className='my-6'>
      <h2
        className='cv-section-title text-center font-bold text-sm mb-2'
        style={{ color: resumeInfo?.themeColor }}
      >
        Certifications
      </h2>
      <hr style={{ borderColor: resumeInfo?.themeColor }} />
      {items.map((item, index) => (
        <div key={index} className='cv-entry my-4'>
          <h2 className='text-sm font-bold' style={{ color: resumeInfo?.themeColor }}>{item.name}</h2>
          <h2 className='text-xs flex justify-between gap-2'>
            <span>{item.issuer}</span>
            <span>{item.date}</span>
          </h2>
          {item.credentialId && <p className='text-xs my-1'>{item.credentialId}</p>}
        </div>
      ))}
    </div>
  )
}

export default CertificationsPreview
