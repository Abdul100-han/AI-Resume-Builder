/* eslint-disable react/prop-types */
import PersonalDetailPreview from '../preview/PersonalDetailPreview'
import SummeryPreview from '../preview/SummeryPreview'
import ExperiencePreview from '../preview/ExperiencePreview'
import EducationalPreview from '../preview/EducationalPreview'
import SkillsPreview from '../preview/SkillsPreview'
import CertificationsPreview from '../preview/CertificationsPreview'
import ProjectsPreview from '../preview/ProjectsPreview'
import { DEFAULT_THEME } from './templates'

function ClassicTemplate({ resumeInfo }) {
  return (
    <div
      className='cv-page cv-classic bg-white shadow-lg h-full p-14 border-t-[20px]'
      style={{ borderColor: resumeInfo?.themeColor || DEFAULT_THEME }}
    >
      <PersonalDetailPreview resumeInfo={resumeInfo} />
      <SummeryPreview resumeInfo={resumeInfo} />
      <ExperiencePreview resumeInfo={resumeInfo} />
      <EducationalPreview resumeInfo={resumeInfo} />
      <ProjectsPreview resumeInfo={resumeInfo} />
      <CertificationsPreview resumeInfo={resumeInfo} />
      <SkillsPreview resumeInfo={resumeInfo} />
    </div>
  )
}

export default ClassicTemplate
