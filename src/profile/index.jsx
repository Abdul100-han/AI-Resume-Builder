import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { LoaderCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import BackendApi from '../../service/BackendApi'
import { getLocalUser, saveLocalUser } from '@/lib/localUser'
import { toast } from 'sonner'
import DemoAccounts from './DemoAccounts'

const DEPARTMENTS = [
  'Computer Science',
  'Software Engineering / HND SWD',
  'Mass Communication',
  'Electrical Engineering',
  'Business Administration',
  'Accountancy',
  'Civil Engineering',
  'Mechanical Engineering',
]

const emptyProfile = {
  fullName: '',
  contactEmail: '',
  institution: 'Kano State Polytechnic',
  department: '',
  academicStatus: '',
  graduationYear: '',
  targetRoles: '',
  skillsSummary: '',
}

const fieldClass = 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
const SAVED_FLAG = 'resume-builder-profile-saved'

function StudentProfile() {
  const [ownerEmail, setOwnerEmail] = useState('')
  const [form, setForm] = useState(null)
  const [customDepartment, setCustomDepartment] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem(SAVED_FLAG)) {
      sessionStorage.removeItem(SAVED_FLAG)
      toast('Student profile saved')
    }
    const user = getLocalUser()
    setOwnerEmail(user.email)
    BackendApi.getProfile(user.email)
      .then((resp) => {
        const profile = { ...emptyProfile, ...(resp.data.studentProfile || {}) }
        const known = DEPARTMENTS.includes(profile.department)
        setCustomDepartment(known || !profile.department ? '' : profile.department)
        setForm({
          ...profile,
          department: known || !profile.department ? profile.department : 'Other',
          fullName: profile.fullName || (user.name !== 'Guest' ? user.name : ''),
        })
      })
      .catch(() => {
        setForm(emptyProfile)
        toast('Could not load the profile. Check that the API server is running and Supabase is configured, then refresh.')
      })
  }, [])

  const setField = (name, value) => setForm((current) => ({ ...current, [name]: value }))

  const onSave = (event) => {
    event.preventDefault()
    const department = form.department === 'Other' ? customDepartment.trim() : form.department
    setLoading(true)
    BackendApi.saveProfile({
      email: getLocalUser().email,
      ...form,
      department,
    })
      .then((resp) => {
        saveLocalUser({ name: resp.data.name })
        sessionStorage.setItem(SAVED_FLAG, '1')
        window.location.reload()
      })
      .catch((error) => {
        toast(error.response?.data?.message || 'Could not save the profile')
      })
      .finally(() => setLoading(false))
  }

  return (
    <div className="p-10 md:px-20 lg:px-32">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Kano State Polytechnic</p>
      <h2 className="mt-2 font-bold text-3xl">Student profile</h2>
      <p className="mt-2 max-w-2xl text-gray-500">
        Final-year students and recent graduates can save their academic details here. New resumes start from this profile. No password is required.
      </p>

      {!form ? (
        <p className="mt-8 text-gray-500">Loading profile...</p>
      ) : (
        <form onSubmit={onSave} className="mt-8 max-w-2xl space-y-4 rounded-lg border border-t-4 border-t-primary p-5 shadow-lg">
          <div>
            <label className="text-sm" htmlFor="fullName">Full name</label>
            <Input id="fullName" value={form.fullName} onChange={(e) => setField('fullName', e.target.value)} required />
          </div>
          <div>
            <label className="text-sm" htmlFor="contactEmail">Contact email</label>
            <Input id="contactEmail" type="email" value={form.contactEmail} onChange={(e) => setField('contactEmail', e.target.value)} required />
            <p className="mt-1 text-xs text-gray-500">Shown on your CV. This browser session stays linked to {ownerEmail}.</p>
          </div>
          <div>
            <label className="text-sm" htmlFor="institution">Institution</label>
            <Input id="institution" value={form.institution} onChange={(e) => setField('institution', e.target.value)} required />
          </div>
          <div>
            <label className="text-sm" htmlFor="department">Department / program</label>
            <select id="department" className={fieldClass} value={form.department} onChange={(e) => setField('department', e.target.value)} required>
              <option value="">Select a program</option>
              {DEPARTMENTS.map((department) => (
                <option key={department} value={department}>{department}</option>
              ))}
              <option value="Other">Other</option>
            </select>
            {form.department === 'Other' && (
              <Input className="mt-2" placeholder="Enter your department" value={customDepartment} onChange={(e) => setCustomDepartment(e.target.value)} required />
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm" htmlFor="academicStatus">Academic status</label>
              <select id="academicStatus" className={fieldClass} value={form.academicStatus} onChange={(e) => setField('academicStatus', e.target.value)} required>
                <option value="">Select status</option>
                <option value="Final-Year Student">Final-Year Student</option>
                <option value="Recent Graduate">Recent Graduate</option>
              </select>
            </div>
            <div>
              <label className="text-sm" htmlFor="graduationYear">Graduation year</label>
              <Input id="graduationYear" inputMode="numeric" placeholder="2026" value={form.graduationYear} onChange={(e) => setField('graduationYear', e.target.value)} required />
            </div>
          </div>
          <div>
            <label className="text-sm" htmlFor="targetRoles">Target roles / career interests</label>
            <Input id="targetRoles" placeholder="Software developer, data analyst" value={form.targetRoles} onChange={(e) => setField('targetRoles', e.target.value)} />
          </div>
          <div>
            <label className="text-sm" htmlFor="skillsSummary">Core skills</label>
            <Textarea id="skillsSummary" placeholder="JavaScript, React, communication" value={form.skillsSummary} onChange={(e) => setField('skillsSummary', e.target.value)} />
          </div>
          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? <LoaderCircle className="animate-spin" /> : 'Save profile'}
            </Button>
            <Link to="/dashboard">
              <Button type="button" variant="outline">Back to resumes</Button>
            </Link>
          </div>
        </form>
      )}

      <DemoAccounts currentEmail={ownerEmail} />
    </div>
  )
}

export default StudentProfile
