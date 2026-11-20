/* eslint-disable react/prop-types */
import PersonalDetailPreview from '../preview/PersonalDetailPreview'
import SummeryPreview from '../preview/SummeryPreview'
import ExperiencePreview from '../preview/ExperiencePreview'
import EducationalPreview from '../preview/EducationalPreview'
import SkillsPreview from '../preview/SkillsPreview'
import { DEFAULT_THEME } from './templates'

// The original single-column layout.
function ClassicTemplate({ resumeInfo }) {
  return (
    <div
      className='cv-page cv-classic bg-white shadow-lg h-full p-14 border-t-[20px]'
      style={{ borderColor: resumeInfo?.themeColor || DEFAULT_THEME }}
    >
      <PersonalDetailPreview resumeInfo={resumeInfo} />
      <SummeryPreview resumeInfo={resumeInfo} />
      {(resumeInfo?.experience ?? []).length > 0 && <ExperiencePreview resumeInfo={resumeInfo} />}
      {(resumeInfo?.education ?? []).length > 0 && <EducationalPreview resumeInfo={resumeInfo} />}
      {(resumeInfo?.skills ?? []).length > 0 && <SkillsPreview resumeInfo={resumeInfo} />}
    </div>
  )
}

export default ClassicTemplate
