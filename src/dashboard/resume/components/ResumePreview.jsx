import { ResumeInfoContext } from '@/context/ResumeInfoContext'
import { useContext } from 'react'
import ClassicTemplate from './templates/ClassicTemplate'
import ModernTemplate from './templates/ModernTemplate'
import { templateId } from './templates/templates'

const COMPONENTS = {
  classic: ClassicTemplate,
  modern: ModernTemplate,
}

function ResumePreview() {
  const { resumeInfo } = useContext(ResumeInfoContext)
  const Template = COMPONENTS[templateId(resumeInfo?.template)]
  return <Template resumeInfo={resumeInfo} />
}

export default ResumePreview
