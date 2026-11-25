import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ResumeInfoContext } from '@/context/ResumeInfoContext'
import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import BackendApi from './../../../../../service/BackendApi';
import { getLocalUser } from '@/lib/localUser';
import { Brain, LoaderCircle } from 'lucide-react';
import { toast } from 'sonner';
import { generateJson, hasGeminiKey } from './../../../../../service/AIModal';

const prompt="Job Title: {jobTitle}. Write 3 professional resume summaries, one for Fresher, one for Mid Level, and one for Senior. Return a JSON array only. Each item must use the keys \"summary\" and \"experience_level\". Each summary should be 3 to 4 lines."

const toSummaryList = (parsed) => {
    if (Array.isArray(parsed)) return parsed
    if (Array.isArray(parsed?.summaries)) return parsed.summaries
    if (Array.isArray(parsed?.items)) return parsed.items
    return []
}
function Summery({enabledNext}) {
    const {resumeInfo,setResumeInfo}=useContext(ResumeInfoContext);
    const [summery,setSummery]=useState(() => resumeInfo?.summery ?? '');
    const [loading,setLoading]=useState(false);
    const params=useParams();
    const [aiGeneratedSummeryList,setAiGenerateSummeryList]=useState();
    useEffect(()=>{
        summery&&setResumeInfo({
            ...resumeInfo,
            summery:summery
        })
    },[summery])

    const GenerateSummeryFromAI=async()=>{
        if(!hasGeminiKey()){
            toast('Add VITE_GOOGLE_AI_API_KEY to enable AI suggestions.')
            return
        }
        setLoading(true)
        const PROMPT=prompt.replace('{jobTitle}',resumeInfo?.jobTitle);
        try {
            const parsed = await generateJson(PROMPT)
            setAiGenerateSummeryList(toSummaryList(parsed))
        } catch {
            toast('Could not generate a summary. Check the Gemini API key and try again.')
        } finally {
            setLoading(false)
        }
    }

    const onSave=(e)=>{
        e.preventDefault();
       
        setLoading(true)
        BackendApi.updateResume(params?.resumeId, { summery }, getLocalUser().email).then(()=>{
            enabledNext(true);
            setLoading(false);
            toast("Details updated")
        },()=>{
            setLoading(false);
            toast('Server Error, Please try again!')
        })
    }
    return (
    <div>
         <div className='p-5 shadow-lg rounded-lg border-t-primary border-t-4 mt-10'>
        <h2 className='font-bold text-lg'>Professional Summary</h2>
        <p>Write a short professional summary for the role you want.</p>

        <form className='mt-7' onSubmit={onSave}>
            <div className='flex justify-between items-end'>
                <label>Add Summery</label>
                <Button variant="outline" onClick={()=>GenerateSummeryFromAI()} 
                type="button" size="sm" className="border-primary text-primary flex gap-2"> 
                <Brain className='h-4 w-4' />  Generate from AI</Button>
            </div>
            <Textarea className="mt-5" required
            value={summery}
            onChange={(e)=>setSummery(e.target.value)}
            />
            <div className='mt-2 flex justify-end'>
            <Button type="submit"
                disabled={loading}>
                    {loading?<LoaderCircle className='animate-spin' />:'Save'}
                    </Button>
            </div>
        </form>
        </div>

        
       {aiGeneratedSummeryList&& <div className='my-5'>
            <h2 className='font-bold text-lg'>Suggestions</h2>
            {(aiGeneratedSummeryList ?? []).map((item,index)=>(
                <div key={index} 
                onClick={()=>setSummery(item?.summary || item?.summery)}
                className='p-5 shadow-lg my-4 rounded-lg cursor-pointer'>
                    <h2 className='font-bold my-1 text-primary'>Level: {item?.experience_level}</h2>
                    <p>{item?.summary || item?.summery}</p>
                </div>
            ))}
        </div>}

    </div>
  )
}

export default Summery