import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import BackendApi from '../../service/BackendApi'
import { getLocalUser } from '@/lib/localUser'
import { Button } from '@/components/ui/button'

function scoreClass(score) {
  if (score >= 70) return 'bg-emerald-100 text-emerald-800'
  if (score >= 40) return 'bg-amber-100 text-amber-800'
  return 'bg-slate-100 text-slate-700'
}

function JobMatches() {
  const [results, setResults] = useState([])
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const user = getLocalUser()
    BackendApi.getJobMatches(user.email)
      .then((resp) => {
        setResults(resp.data.results || [])
        setSkills(resp.data.skills || [])
      })
      .catch(() => setError('Could not load job matches. Start the API server and MongoDB, then refresh.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-10 md:px-20 lg:px-32">
      <h2 className="font-bold text-3xl">Job matches</h2>
      <p className="text-gray-500 mt-2">
        Scores compare the skills saved on your CV with each vacancy&apos;s required skills.
      </p>

      <div className="mt-4 text-sm text-gray-600">
        {skills.length > 0
          ? `Your saved skills: ${skills.join(', ')}`
          : 'No skills saved yet. Add skills on a resume, then come back to see match scores.'}
      </div>

      {loading && <p className="mt-8 text-gray-500">Calculating matches...</p>}
      {error && <p className="mt-8 text-red-600">{error}</p>}

      <div className="mt-8 grid gap-4">
        {results.map(({ job, score, matchedSkills, missingSkills }) => (
          <div key={job._id} className="border rounded-lg p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold text-lg">{job.jobTitle}</h3>
                <p className="text-sm text-gray-500">{job.company}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-sm font-semibold ${scoreClass(score)}`}>
                {score}% match
              </span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-slate-100">
              <div className="h-2 rounded-full bg-primary" style={{ width: `${score}%` }} />
            </div>
            <p className="mt-3 text-sm">{job.description}</p>
            <p className="mt-3 text-sm"><span className="font-medium">Matched:</span> {matchedSkills.length ? matchedSkills.join(', ') : 'None yet'}</p>
            <p className="mt-1 text-sm"><span className="font-medium">Missing:</span> {missingSkills.length ? missingSkills.join(', ') : 'None'}</p>
          </div>
        ))}
      </div>

      {!loading && !error && results.length === 0 && (
        <div className="mt-8">
          <p className="text-gray-500">No vacancies have been posted.</p>
          <Link to="/admin"><Button className="mt-4" variant="outline">Open admin portal</Button></Link>
        </div>
      )}
    </div>
  )
}

export default JobMatches
