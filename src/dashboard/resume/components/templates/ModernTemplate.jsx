/* eslint-disable react/prop-types */
import { Mail, MapPin, Phone } from 'lucide-react'
import { DEFAULT_THEME } from './templates'
import {
  filledCertifications,
  filledEducation,
  filledExperience,
  filledProjects,
  filledSkills,
} from '@/lib/resume'

function SectionTitle({ color, children }) {
  return (
    <h3
      className='cv-section-title text-[11px] font-bold uppercase tracking-[0.18em] mb-2 pb-1 border-b'
      style={{ color, borderColor: `${color}55` }}
    >
      {children}
    </h3>
  )
}

const dateRange = (start, end, current) =>
  [start, current ? 'Present' : end].filter(Boolean).join(' – ')

// Two-column layout: tinted sidebar (contact, skills) + main column (profile, education, experience).
function ModernTemplate({ resumeInfo }) {
  const color = resumeInfo?.themeColor || DEFAULT_THEME
  const experience = filledExperience(resumeInfo?.experience)
  const education = filledEducation(resumeInfo?.education)
  const skills = filledSkills(resumeInfo?.skills)
  const certifications = filledCertifications(resumeInfo?.certifications)
  const projects = filledProjects(resumeInfo?.projects)
  const summary = String(resumeInfo?.summery || '').trim()
  const contacts = [
    { icon: Phone, value: resumeInfo?.phone },
    { icon: Mail, value: resumeInfo?.email },
    { icon: MapPin, value: resumeInfo?.address },
  ].filter((c) => c.value)

  return (
    <div className='cv-page cv-modern flex flex-col bg-white shadow-lg h-full text-slate-800'>
      <header className='px-10 pt-10 pb-6 border-b-4' style={{ borderColor: color }}>
        <h1 className='text-3xl font-bold tracking-tight' style={{ color }}>
          {resumeInfo?.firstName} {resumeInfo?.lastName}
        </h1>
        {resumeInfo?.jobTitle && (
          <p className='mt-1 text-sm font-medium uppercase tracking-widest text-slate-500'>{resumeInfo.jobTitle}</p>
        )}
      </header>

      <div className='grid flex-1 grid-cols-[34%_66%]'>
        <aside className='cv-column px-6 py-8 space-y-7' style={{ backgroundColor: `${color}12` }}>
          {contacts.length > 0 && (
            <section>
              <SectionTitle color={color}>Contact</SectionTitle>
              <ul className='space-y-2 list-none text-xs'>
                {contacts.map(({ icon: Icon, value }) => (
                  <li key={value} className='flex items-start gap-2 break-all'>
                    <Icon className='h-3.5 w-3.5 shrink-0 mt-px' style={{ color }} />
                    <span>{value}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {skills.length > 0 && (
            <section>
              <SectionTitle color={color}>Skills</SectionTitle>
              <ul className='space-y-2 list-none'>
                {skills.map((skill, index) => (
                  <li key={index} className='cv-entry text-xs'>
                    <div className='flex items-center justify-between gap-2'>
                      <span>{skill.name}</span>
                      {skill.rating > 0 && (
                        <span className='flex gap-0.5' aria-label={`${skill.rating} out of 5`}>
                          {[1, 2, 3, 4, 5].map((dot) => (
                            <span
                              key={dot}
                              className='h-1.5 w-1.5 rounded-full'
                              style={{ backgroundColor: dot <= skill.rating ? color : `${color}33` }}
                            />
                          ))}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>

        <main className='cv-column px-8 py-8 space-y-7'>
          {summary && (
            <section>
              <SectionTitle color={color}>Professional Summary</SectionTitle>
              <p className='text-xs leading-relaxed'>{summary}</p>
            </section>
          )}

          {education.length > 0 && (
            <section>
              <SectionTitle color={color}>Education</SectionTitle>
              <div className='space-y-4'>
                {education.map((item, index) => (
                  <div key={index} className='cv-entry'>
                    <div className='flex justify-between gap-3 text-sm'>
                      <h4 className='font-semibold'>
                        {[item.degree, item.major].filter(Boolean).join(' in ') || item.universityName}
                      </h4>
                      <span className='text-xs text-slate-500 shrink-0'>{dateRange(item.startDate, item.endDate)}</span>
                    </div>
                    <p className='text-xs font-medium' style={{ color }}>{item.universityName}</p>
                    {item.description && <p className='text-xs mt-1'>{item.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {experience.length > 0 && (
            <section>
              <SectionTitle color={color}>Experience</SectionTitle>
              <div className='space-y-4'>
                {experience.map((item, index) => (
                  <div key={index} className='cv-entry'>
                    <div className='flex justify-between gap-3 text-sm'>
                      <h4 className='font-semibold'>{item.title}</h4>
                      <span className='text-xs text-slate-500 shrink-0'>
                        {dateRange(item.startDate, item.endDate, item.currentlyWorking)}
                      </span>
                    </div>
                    <p className='text-xs font-medium' style={{ color }}>
                      {[item.companyName, item.city, item.state].filter(Boolean).join(', ')}
                    </p>
                    {item.workSummery && (
                      <div className='cv-rich text-xs mt-1' dangerouslySetInnerHTML={{ __html: item.workSummery }} />
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {projects.length > 0 && (
            <section>
              <SectionTitle color={color}>Projects</SectionTitle>
              <div className='space-y-4'>
                {projects.map((item, index) => (
                  <div key={index} className='cv-entry'>
                    <div className='flex justify-between gap-3 text-sm'>
                      <h4 className='font-semibold'>{item.name}</h4>
                      <span className='text-xs text-slate-500 shrink-0'>
                        {[item.startDate, item.endDate].filter(Boolean).join(' – ')}
                      </span>
                    </div>
                    {item.role && <p className='text-xs font-medium' style={{ color }}>{item.role}</p>}
                    {item.url && <p className='text-xs break-all'>{item.url}</p>}
                    {item.description && <p className='text-xs mt-1'>{item.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {certifications.length > 0 && (
            <section>
              <SectionTitle color={color}>Certifications</SectionTitle>
              <div className='space-y-3'>
                {certifications.map((item, index) => (
                  <div key={index} className='cv-entry'>
                    <div className='flex justify-between gap-3 text-sm'>
                      <h4 className='font-semibold'>{item.name}</h4>
                      <span className='text-xs text-slate-500 shrink-0'>{item.date}</span>
                    </div>
                    {item.issuer && <p className='text-xs font-medium' style={{ color }}>{item.issuer}</p>}
                    {item.credentialId && <p className='text-xs'>{item.credentialId}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  )
}

export default ModernTemplate
