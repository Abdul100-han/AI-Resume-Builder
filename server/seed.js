/* eslint-env node */
// Demo data for the Kano State Polytechnic case study.
//
//   npm run seed            insert anything that is missing (safe to run repeatedly)
//   npm run seed -- --reset also restore demo records that were edited during testing
//
// Only records owned by this script are touched: vacancies are matched by title + company,
// students by their demo email, and CVs by a fixed resumeId. Nothing else is deleted.
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import connectDB from './config/db.js'
import { connectLegacyMongo } from './config/legacyMongo.js'
import { ensureAdmin } from './controllers/authController.js'
import JobVacancy from './models/JobVacancy.js'
import Resume from './models/Resume.js'
import User from './models/User.js'

dotenv.config()

const RESET = process.argv.includes('--reset')
const INSTITUTION = 'Kano State Polytechnic'

// Company names are fictional.
const JOBS = [
  {
    jobTitle: 'Junior Software Developer',
    company: 'Gidan Tech Solutions Ltd',
    description:
      'Kano-based software house building school management and payment platforms for clients across Northern Nigeria. '
      + 'You will build React front-ends and Node.js REST APIs backed by MongoDB, write clean code with Git, '
      + 'and work with senior developers in an agile team. Open to ND/HND Computer Science or Software Engineering graduates.',
    requiredSkills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Git'],
  },
  {
    jobTitle: 'IT Support & Network Technician',
    company: 'Bompai Logistics Ltd',
    description:
      'Support 60+ staff at our Bompai Industrial Estate office in Kano. Install and maintain computers, printers, '
      + 'LAN/Wi-Fi networks and CCTV, troubleshoot hardware and Windows issues, and set up user accounts. '
      + 'ND/HND in Computer Science, Computer Engineering or Electrical Engineering preferred.',
    requiredSkills: ['Computer Networking', 'Troubleshooting', 'Windows', 'Hardware Maintenance', 'Microsoft Office'],
  },
  {
    jobTitle: 'Web Developer',
    company: 'Arewa Creative Studio',
    description:
      'Digital agency in Kano designing websites for SMEs, schools and NGOs. Build responsive websites with HTML, CSS '
      + 'and JavaScript, customise WordPress themes, and maintain PHP/MySQL back-ends. Portfolio of personal or SIWES projects required.',
    requiredSkills: ['HTML', 'CSS', 'JavaScript', 'PHP', 'MySQL', 'WordPress'],
  },
  {
    jobTitle: 'Data & Operations Analyst',
    company: 'Kurmi Agro-Allied Ltd',
    description:
      'Agro-processing company in Kano and Jigawa. Clean and analyse sales, procurement and warehouse data, '
      + 'build weekly dashboards for management, and write SQL queries against our inventory database. '
      + 'HND in Statistics, Computer Science, Accountancy or Business Administration.',
    requiredSkills: ['Excel', 'SQL', 'Data Analysis', 'Power BI', 'Communication'],
  },
  {
    jobTitle: 'Electrical & Systems Trainee',
    company: 'Dala Power Engineering Ltd',
    description:
      'Graduate trainee programme in Kano. Assist engineers with building wiring, solar PV and inverter installations, '
      + 'panel maintenance and fault finding. Read electrical drawings and follow HSE safety procedures. '
      + 'ND/HND in Electrical/Electronic Engineering.',
    requiredSkills: ['Electrical Installation', 'Solar PV Installation', 'AutoCAD', 'Troubleshooting', 'Safety Procedures'],
  },
  {
    jobTitle: 'Digital Marketing & Content Officer',
    company: 'Sahel Media Services',
    description:
      'Media and advertising firm in Kano serving brands across the North. Plan social media campaigns, write and edit '
      + 'English and Hausa content, design graphics in Canva, and report on engagement. '
      + 'ND/HND in Mass Communication or Business Administration.',
    requiredSkills: ['Social Media Marketing', 'Content Writing', 'Canva', 'SEO', 'Communication'],
  },
]

const STUDENTS = [
  {
    email: 'aisha.bello@demo.local',
    resumeId: 'demo-aisha-bello-cv',
    template: 'modern',
    themeColor: '#0f6b5e',
    profile: {
      fullName: 'Aisha Musa Bello',
      department: 'Computer Science',
      academicStatus: 'Final-Year Student',
      graduationYear: '2026',
      targetRoles: 'Junior Software Developer, Web Developer',
      skillsSummary: 'JavaScript, React, Node.js, MongoDB, HTML, CSS, Git, MySQL',
    },
    resume: {
      jobTitle: 'Junior Software Developer',
      phone: '+234 803 000 0001',
      address: 'Kano, Nigeria',
      summery:
        'Final-year HND Computer Science student at Kano State Polytechnic with hands-on experience building web '
        + 'applications in React and Node.js. Built a student result portal for my final-year project and completed '
        + 'SIWES as a junior web developer. Looking for a junior developer role in Kano.',
      experience: [
        {
          title: 'SIWES Trainee – Web Development',
          companyName: 'Gidan Tech Solutions Ltd',
          city: 'Kano',
          state: 'Kano State',
          startDate: 'Jun 2024',
          endDate: 'Nov 2024',
          currentlyWorking: false,
          workSummery:
            '<ul><li>Built React components for a school fees payment dashboard</li>'
            + '<li>Wrote Node.js/Express REST endpoints and MongoDB queries</li>'
            + '<li>Used Git and GitHub for code reviews with the team</li></ul>',
        },
      ],
      education: [
        {
          universityName: INSTITUTION,
          degree: 'HND',
          major: 'Computer Science',
          startDate: '2024',
          endDate: '2026',
          description: 'Final-year project: AI-assisted CV builder with NLP job matching.',
        },
        {
          universityName: INSTITUTION,
          degree: 'ND',
          major: 'Computer Science',
          startDate: '2021',
          endDate: '2023',
          description: 'Upper Credit.',
        },
      ],
      skills: [
        { name: 'JavaScript', rating: 4 },
        { name: 'React', rating: 4 },
        { name: 'Node.js', rating: 3 },
        { name: 'MongoDB', rating: 3 },
        { name: 'HTML', rating: 5 },
        { name: 'CSS', rating: 4 },
        { name: 'Git', rating: 3 },
        { name: 'MySQL', rating: 3 },
      ],
    },
  },
  {
    email: 'ibrahim.yakubu@demo.local',
    resumeId: 'demo-ibrahim-yakubu-cv',
    template: 'classic',
    themeColor: '#1d4ed8',
    profile: {
      fullName: 'Ibrahim Sani Yakubu',
      department: 'Electrical Engineering',
      academicStatus: 'Recent Graduate',
      graduationYear: '2025',
      targetRoles: 'Electrical Technician, IT Support Technician',
      skillsSummary: 'Electrical Installation, Solar PV Installation, AutoCAD, Troubleshooting, Networking, Microsoft Office',
    },
    resume: {
      jobTitle: 'Electrical Technician',
      phone: '+234 806 000 0002',
      address: 'Kano, Nigeria',
      summery:
        'HND Electrical Engineering graduate from Kano State Polytechnic. Experienced in building wiring, solar PV '
        + 'installation and fault finding from SIWES and NYSC placements. Comfortable with basic computer networking '
        + 'and office IT support.',
      experience: [
        {
          title: 'Installation Assistant (NYSC)',
          companyName: 'Dala Power Engineering Ltd',
          city: 'Kano',
          state: 'Kano State',
          startDate: 'Jan 2025',
          endDate: '',
          currentlyWorking: true,
          workSummery:
            '<ul><li>Installed 5 kVA solar PV and inverter systems for homes and clinics</li>'
            + '<li>Traced and repaired wiring faults following safety procedures</li></ul>',
        },
        {
          title: 'SIWES Trainee – Electrical Maintenance',
          companyName: 'Bompai Logistics Ltd',
          city: 'Kano',
          state: 'Kano State',
          startDate: 'Jun 2023',
          endDate: 'Nov 2023',
          currentlyWorking: false,
          workSummery: '<ul><li>Maintained distribution boards and helped set up the office LAN</li></ul>',
        },
      ],
      education: [
        {
          universityName: INSTITUTION,
          degree: 'HND',
          major: 'Electrical Engineering',
          startDate: '2022',
          endDate: '2024',
          description: 'Project: Solar-powered irrigation pump controller.',
        },
      ],
      skills: [
        { name: 'Electrical Installation', rating: 5 },
        { name: 'Solar PV Installation', rating: 4 },
        { name: 'AutoCAD', rating: 3 },
        { name: 'Troubleshooting', rating: 4 },
        { name: 'Networking', rating: 3 },
        { name: 'Microsoft Office', rating: 4 },
      ],
    },
  },
]

// Insert-if-missing by default; overwrite only with --reset.
const upsert = (Model, filter, doc) =>
  Model.findOneAndUpdate(filter, RESET ? { $set: doc } : { $setOnInsert: doc }, {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true,
    includeResultMetadata: true,
  })

const created = (result) => !result.lastErrorObject?.updatedExisting

async function seed() {
  await connectDB()
  await ensureAdmin() // admin now lives in Supabase
  // Vacancies, students and CVs are still Mongo models until Phase 2 rewrites this script.
  if (!(await connectLegacyMongo())) throw new Error('Seeding vacancies and CVs still needs MONGO_URI until Phase 2.')
  const admin = await User.findOne({ role: 'admin' })

  console.log(`\nSeeding demo data (${RESET ? 'reset mode' : 'insert missing only'})`)

  for (const job of JOBS) {
    const result = await upsert(
      JobVacancy,
      { jobTitle: job.jobTitle, company: job.company },
      { ...job, postedBy: admin?._id }
    )
    console.log(`  job     ${created(result) ? 'added   ' : RESET ? 'reset   ' : 'exists  '} ${job.jobTitle} – ${job.company}`)
  }

  const resumeLinks = []
  for (const student of STUDENTS) {
    const { profile, resume } = student
    const [firstName, ...rest] = profile.fullName.split(' ')
    const lastName = rest.join(' ')

    const userResult = await upsert(User, { email: student.email }, {
      name: profile.fullName,
      email: student.email,
      role: 'student',
      personalInfo: { firstName, lastName, phone: resume.phone, address: resume.address, jobTitle: resume.jobTitle },
      education: resume.education,
      experience: resume.experience,
      skills: resume.skills,
      studentProfile: { ...profile, contactEmail: student.email, institution: INSTITUTION },
    })
    const user = userResult.value

    const resumeResult = await upsert(Resume, { user: user._id, resumeId: student.resumeId }, {
      user: user._id,
      resumeId: student.resumeId,
      title: `${profile.fullName} – CV`,
      template: student.template,
      themeColor: student.themeColor,
      firstName,
      lastName,
      email: student.email,
      ...resume,
    })
    console.log(`  student ${created(userResult) ? 'added   ' : RESET ? 'reset   ' : 'exists  '} ${profile.fullName} <${student.email}>`)
    resumeLinks.push(`  ${profile.fullName.padEnd(22)} /my-resume/${resumeResult.value._id}/view`)
  }

  console.log('\nDemo CVs (open on the frontend, e.g. http://localhost:5173):')
  console.log(resumeLinks.join('\n'))
  console.log(`\nAdmin login: ${process.env.ADMIN_EMAIL || '(ADMIN_EMAIL not set)'} / password from ADMIN_PASSWORD in server/.env`)
  console.log('Demo students: open /profile in development and use "Demo accounts" to switch.\n')
}

seed()
  .catch((error) => {
    console.error(`Seed failed: ${error.message}`)
    process.exitCode = 1
  })
  .finally(() => mongoose.disconnect())
