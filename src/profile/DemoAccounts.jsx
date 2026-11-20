/* eslint-disable react/prop-types */
import { Button } from '@/components/ui/button'
import { resetLocalUser, switchLocalUser } from '@/lib/localUser'

// Must match STUDENTS in server/seed.js.
const DEMO_STUDENTS = [
  { email: 'aisha.bello@demo.local', name: 'Aisha Musa Bello', note: 'HND Computer Science · Final-Year Student' },
  { email: 'ibrahim.yakubu@demo.local', name: 'Ibrahim Sani Yakubu', note: 'HND Electrical Engineering · Recent Graduate' },
]

const showDemoAccounts = import.meta.env.DEV || import.meta.env.VITE_DEMO_MODE === 'true'

function DemoAccounts({ currentEmail }) {
  if (!showDemoAccounts) return null

  const choose = (student) => {
    if (student) switchLocalUser(student.email, student.name)
    else resetLocalUser()
    window.location.reload()
  }

  return (
    <div className='mt-10 max-w-2xl rounded-lg border border-dashed p-5'>
      <h3 className='font-semibold'>Demo accounts</h3>
      <p className='mt-1 text-sm text-gray-500'>
        Switch this browser to a seeded Kano State Polytechnic student (run <code>npm run seed</code> first).
        Shown in development or when <code>VITE_DEMO_MODE=true</code>.
      </p>
      <div className='mt-4 grid gap-3 sm:grid-cols-2'>
        {DEMO_STUDENTS.map((student) => (
          <button
            key={student.email}
            type='button'
            onClick={() => choose(student)}
            className={`rounded-md border p-3 text-left text-sm hover:bg-slate-50 ${
              currentEmail === student.email ? 'border-primary ring-1 ring-primary' : ''
            }`}
          >
            <span className='block font-medium'>{student.name}</span>
            <span className='block text-xs text-gray-500'>{student.note}</span>
          </button>
        ))}
      </div>
      <Button type='button' variant='ghost' size='sm' className='mt-3' onClick={() => choose(null)}>
        Start a new guest session
      </Button>
    </div>
  )
}

export default DemoAccounts
