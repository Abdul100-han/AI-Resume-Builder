import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import BackendApi from '../../service/BackendApi'
import { LoaderCircle } from 'lucide-react'

const emptyForm = {
  jobTitle: '',
  company: '',
  description: '',
  requiredSkills: '',
}

function AdminDashboard() {
  const [token, setToken] = useState(() => localStorage.getItem('adminToken') || '')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [jobs, setJobs] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const loadJobs = () => {
    BackendApi.getJobs()
      .then((resp) => setJobs(resp.data))
      .catch(() => setMessage('Could not load vacancies. Is the API server running?'))
  }

  useEffect(() => {
    if (token) loadJobs()
  }, [token])

  const onLogin = (event) => {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    BackendApi.login(email, password)
      .then((resp) => {
        localStorage.setItem('adminToken', resp.data.token)
        setToken(resp.data.token)
        setPassword('')
      })
      .catch((error) => {
        setMessage(error.response?.data?.message || 'Login failed')
      })
      .finally(() => setLoading(false))
  }

  const onLogout = () => {
    localStorage.removeItem('adminToken')
    setToken('')
    setJobs([])
    setForm(emptyForm)
    setEditingId(null)
  }

  const onSubmit = (event) => {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    const payload = {
      jobTitle: form.jobTitle,
      company: form.company,
      description: form.description,
      requiredSkills: form.requiredSkills,
    }
    const request = editingId
      ? BackendApi.updateJob(editingId, payload)
      : BackendApi.createJob(payload)

    request
      .then(() => {
        setForm(emptyForm)
        setEditingId(null)
        setMessage(editingId ? 'Vacancy updated' : 'Vacancy posted')
        loadJobs()
      })
      .catch((error) => {
        setMessage(error.response?.data?.message || 'Could not save vacancy')
      })
      .finally(() => setLoading(false))
  }

  const onEdit = (job) => {
    setEditingId(job._id)
    setForm({
      jobTitle: job.jobTitle,
      company: job.company,
      description: job.description,
      requiredSkills: (job.requiredSkills || []).join(', '),
    })
  }

  const onDelete = (job) => {
    if (!window.confirm(`Delete ${job.jobTitle} at ${job.company}?`)) return
    BackendApi.deleteJob(job._id)
      .then(() => {
        if (editingId === job._id) {
          setEditingId(null)
          setForm(emptyForm)
        }
        loadJobs()
      })
      .catch((error) => setMessage(error.response?.data?.message || 'Could not delete vacancy'))
  }

  if (!token) {
    return (
      <div className="max-w-md mx-auto p-10">
        <h2 className="font-bold text-3xl">Admin sign in</h2>
        <p className="text-gray-500 mt-2">Post and manage job vacancies.</p>
        <form className="mt-8 space-y-4" onSubmit={onLogin}>
          <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {message && <p className="text-sm text-red-600">{message}</p>}
          <Button type="submit" disabled={loading}>
            {loading ? <LoaderCircle className="animate-spin" /> : 'Sign in'}
          </Button>
        </form>
      </div>
    )
  }

  return (
    <div className="p-10 md:px-20 lg:px-32">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-bold text-3xl">Job vacancies</h2>
          <p className="text-gray-500">Create openings students can match against their CV.</p>
        </div>
        <Button variant="outline" onClick={onLogout}>Sign out</Button>
      </div>

      <form onSubmit={onSubmit} className="mt-8 grid gap-3 border rounded-lg p-5">
        <h3 className="font-semibold text-lg">{editingId ? 'Edit vacancy' : 'Post a vacancy'}</h3>
        <Input placeholder="Job title" value={form.jobTitle} onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} required />
        <Input placeholder="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} required />
        <Textarea placeholder="Job description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
        <Input placeholder="Required skills, separated by commas" value={form.requiredSkills} onChange={(e) => setForm({ ...form, requiredSkills: e.target.value })} />
        {message && <p className="text-sm text-gray-600">{message}</p>}
        <div className="flex gap-2">
          <Button type="submit" disabled={loading}>
            {loading ? <LoaderCircle className="animate-spin" /> : editingId ? 'Update vacancy' : 'Post vacancy'}
          </Button>
          {editingId && (
            <Button type="button" variant="outline" onClick={() => { setEditingId(null); setForm(emptyForm) }}>
              Cancel
            </Button>
          )}
        </div>
      </form>

      <div className="mt-8 grid gap-4">
        {jobs.map((job) => (
          <div key={job._id} className="border rounded-lg p-5">
            <div className="flex justify-between gap-4">
              <div>
                <h3 className="font-semibold text-lg">{job.jobTitle}</h3>
                <p className="text-sm text-gray-500">{job.company} · {new Date(job.postedDate).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => onEdit(job)}>Edit</Button>
                <Button variant="outline" size="sm" onClick={() => onDelete(job)}>Delete</Button>
              </div>
            </div>
            <p className="mt-3 text-sm">{job.description}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(job.requiredSkills || []).map((skill) => (
                <span key={skill} className="text-xs bg-slate-100 rounded-full px-3 py-1">{skill}</span>
              ))}
            </div>
          </div>
        ))}
        {jobs.length === 0 && <p className="text-gray-500">No vacancies posted yet.</p>}
      </div>
    </div>
  )
}

export default AdminDashboard
