import Header from '@/components/custom/Header'
import { Button } from '@/components/ui/button'
import { ResumeInfoContext } from '@/context/ResumeInfoContext'
import ResumePreview from '@/dashboard/resume/components/ResumePreview'
import TemplateSelector from '@/dashboard/resume/components/TemplateSelector'
import { Toaster } from '@/components/ui/sonner'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import BackendApi from './../../../../service/BackendApi'
import { normalizeResume } from '@/lib/resume'
import { toast } from 'sonner'
import { RWebShare } from 'react-web-share'
import { Download, Pencil, Share2 } from 'lucide-react'

function ViewResume() {
    const [resumeInfo, setResumeInfo] = useState()
    const [failed, setFailed] = useState(false)
    const { resumeId } = useParams()

    useEffect(() => {
        BackendApi.getResumeById(resumeId)
            .then((resp) => setResumeInfo(normalizeResume(resp.data)))
            .catch(() => {
                setFailed(true)
                toast('Could not load this resume.')
            })
    }, [resumeId])

    // The browser's "Save as PDF" uses this as the default file name.
    useEffect(() => {
        if (!resumeInfo) return undefined
        const previous = document.title
        const name = [resumeInfo.firstName, resumeInfo.lastName].filter(Boolean).join(' ')
        document.title = name ? `${name} - CV` : 'CV'
        return () => { document.title = previous }
    }, [resumeInfo])

    const fullName = [resumeInfo?.firstName, resumeInfo?.lastName].filter(Boolean).join(' ')

    return (
        <ResumeInfoContext.Provider value={{ resumeInfo, setResumeInfo }}>
            <div id='no-print'>
                <Header />

                <div className='my-10 mx-10 md:mx-20 lg:mx-36'>
                    <h2 className='text-center text-2xl font-medium'>Your CV is ready</h2>
                    <p className='text-center text-gray-500 mt-1'>
                        Pick a template, then download it as a PDF or share this link with employers.
                    </p>
                    <div className='flex flex-wrap justify-center gap-3 my-8'>
                        <TemplateSelector />
                        <Link to={`/dashboard/resume/${resumeId}/edit`}>
                            <Button variant='outline' size='sm' className='flex gap-2'><Pencil className='h-4 w-4' /> Edit</Button>
                        </Link>
                        <Button size='sm' className='flex gap-2' onClick={() => window.print()} disabled={!resumeInfo}>
                            <Download className='h-4 w-4' /> Download PDF
                        </Button>
                        <RWebShare
                            data={{
                                text: 'Hello, please open this link to see my CV',
                                url: (import.meta.env.VITE_BASE_URL || window.location.origin) + '/my-resume/' + resumeId + '/view',
                                title: `${fullName || 'My'} CV`,
                            }}
                        >
                            <Button variant='outline' size='sm' className='flex gap-2'><Share2 className='h-4 w-4' /> Share</Button>
                        </RWebShare>
                    </div>
                    <p className='text-center text-xs text-gray-400'>
                        In the print dialog choose <strong>Save as PDF</strong>, paper size <strong>A4</strong>, margins <strong>Default</strong>.
                    </p>
                </div>
            </div>

            <div className='print-container my-10 mx-auto max-w-[850px] px-4'>
                {failed
                    ? <p className='text-center text-gray-500'>This CV could not be found.</p>
                    : <div id='print-area'><ResumePreview /></div>}
            </div>
            <div className='no-print'><Toaster /></div>
        </ResumeInfoContext.Provider>
    )
}

export default ViewResume
