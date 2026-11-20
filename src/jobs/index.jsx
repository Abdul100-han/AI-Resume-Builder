/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import BackendApi from '../../service/BackendApi'
import { getLocalUser } from '@/lib/localUser'
import { Button } from '@/components/ui/button'

const BAND_STYLES = {
  Strong: 'bg-emerald-100 text-emerald-800',
  Good: 'bg-sky-100 text-sky-800',
  Fair: 'bg-amber-100 text-amber-800',
  Low: 'bg-slate-100 text-slate-700',
}

const BANDS = ['All', 'Strong', 'Good', 'Fair', 'Low']

function SkillChips({ items, className, empty }) {
  if (!items.length) return <span className="text-gray-500">{empty}</span>
  return (
    <span className="inline-flex flex-wrap gap-1.5 align-middle">
      {items.map((item) => (
        <span key={item.key} title={item.title} className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>
          {item.label}
        </span>
      ))}
    </span>
  )
}

function MatchCard({ result }) {
  const { job, score, band, matchedSkills, partialSkills = [], missingSkills, matchDetails = [], breakdown, explanation } = result
  const via = Object.fromEntries(matchDetails.map((m) => [m.skill, m]))

  const matched = matchedSkills.map((skill) => {
    const detail = via[skill]
    const title = detail?.via === 'inferred' ? `Inferred from ${detail.from}`
      : detail?.via === 'profile' ? 'Found in your profile text' : 'Listed in your skills'
    return { key: skill, label: detail?.via === 'inferred' ? `${skill} ← ${detail.from}` : skill, title }
  })
  const partial = partialSkills.map((p) => ({ key: p.skill, label: `${p.skill} ~ ${p.related}`, title: `Related skill: ${p.related} (half credit)` }))
  const missing = missingSkills.map((skill) => ({ key: skill, label: skill }))

  return (
    <div className="border rounded-lg p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-lg">{job.jobTitle}</h3>
          <p className="text-sm text-gray-500">{job.company}</p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className={`rounded-full px-3 py-1 text-sm font-semibold ${BAND_STYLES[band] || BAND_STYLES.Low}`}>
            {score}% match
          </span>
          <span className="text-xs text-gray-500">{band} fit</span>
        </div>
      </div>

      <div className="mt-3 h-2 rounded-full bg-slate-100">
        <div className="h-2 rounded-full bg-primary" style={{ width: `${score}%` }} />
      </div>
      {breakdown && (
        <p className="mt-2 text-xs text-gray-500">
          {breakdown.skillCoverage === null
            ? `Text similarity ${breakdown.textSimilarity}% (no required skills listed)`
            : `Skill coverage ${breakdown.skillCoverage}% × ${breakdown.weights.skills * 100}% + text similarity ${breakdown.textSimilarity}% × ${breakdown.weights.context * 100}%`}
        </p>
      )}

      <p className="mt-3 text-sm">{job.description}</p>

      <div className="mt-3 space-y-1.5 text-sm">
        <p><span className="font-medium mr-2">Matched:</span>
          <SkillChips items={matched} className="bg-emerald-50 text-emerald-800" empty="None yet" />
        </p>
        {partial.length > 0 && (
          <p><span className="font-medium mr-2">Partly matched:</span>
            <SkillChips items={partial} className="bg-amber-50 text-amber-800" />
          </p>
        )}
        <p><span className="font-medium mr-2">Missing:</span>
          <SkillChips items={missing} className="bg-red-50 text-red-700" empty="None" />
        </p>
      </div>

      {explanation && (
        <p className="mt-3 rounded-md bg-slate-50 px-3 py-2 text-sm text-gray-700">
          <span className="font-medium">Why this score: </span>{explanation}
        </p>
      )}
    </div>
  )
}

function JobMatches() {
  const [results, setResults] = useState([])
  const [skills, setSkills] = useState([])
  const [band, setBand] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const user = getLocalUser()
    BackendApi.getJobMatches(user.email)
      .then((resp) => {
        setResults(resp.data.results || [])
        setSkills(resp.data.skills || [])
      })
      .catch(() => setError('Could not load job matches. Check that the API server is running and Supabase is configured, then refresh.'))
      .finally(() => setLoading(false))
  }, [])

  const visible = band === 'All' ? results : results.filter((r) => r.band === band)

  return (
    <div className="p-10 md:px-20 lg:px-32">
      <h2 className="font-bold text-3xl">Job matches</h2>
      <p className="text-gray-500 mt-2">
        Scores use NLP matching: your skills, department, target roles and CV text are compared with each
        vacancy&apos;s required skills and description (70% skill coverage + 30% TF-IDF text similarity).
      </p>

      <div className="mt-4 text-sm text-gray-600">
        {skills.length > 0
          ? `Your saved skills: ${skills.join(', ')}`
          : 'No skills saved yet. Add skills on a resume, then come back to see match scores.'}
      </div>

      {results.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {BANDS.map((name) => (
            <Button key={name} size="sm" variant={band === name ? 'default' : 'outline'} onClick={() => setBand(name)}>
              {name}{name !== 'All' && ` (${results.filter((r) => r.band === name).length})`}
            </Button>
          ))}
        </div>
      )}

      {loading && <p className="mt-8 text-gray-500">Calculating matches...</p>}
      {error && <p className="mt-8 text-red-600">{error}</p>}

      <div className="mt-8 grid gap-4">
        {visible.map((result) => <MatchCard key={result.job.id} result={result} />)}
      </div>

      {!loading && !error && results.length > 0 && visible.length === 0 && (
        <p className="mt-8 text-gray-500">No vacancies in the {band} band.</p>
      )}

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
