import Header from '@/components/custom/Header'
import { ArrowRight, PenLine, Sparkles, Target } from 'lucide-react'
import React from 'react'
import { Link } from 'react-router-dom'

const steps = [
  {
    icon: PenLine,
    title: 'Capture your experience',
    text: 'Add your role, education, and skills once. The editor keeps a live preview beside the form.',
  },
  {
    icon: Sparkles,
    title: 'Draft the hard parts',
    text: 'Generate a professional summary and experience bullets from your job title, then edit every line.',
  },
  {
    icon: Target,
    title: 'See where you fit',
    text: 'Compare your saved skills with open vacancies and get a match score plus the skills still missing.',
  },
]

function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-14 px-5 pb-20 pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:pt-24">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Resume studio
            </p>
            <h1 className="mt-4 max-w-xl font-serif text-5xl font-medium leading-[1.05] tracking-tight text-[#10241f] sm:text-6xl">
              A resume that reads like the role you want.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-[#3d524c]">
              Write a clear CV, shape it with AI, and see how closely your skills match the jobs an administrator has posted.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary/90"
              >
                Build your resume
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/jobs"
                className="inline-flex items-center justify-center rounded-full border border-primary/20 bg-white px-6 py-3 text-sm font-semibold text-[#16312b] transition hover:border-primary/40"
              >
                View job matches
              </Link>
            </div>
          </div>

          <div className="rounded-[28px] bg-[#123f38] p-3 shadow-[0_24px_60px_-32px_rgba(16,36,31,0.55)]">
            <article className="rounded-[22px] bg-white px-7 py-8 text-[#16312b] sm:px-9">
              <div className="border-b border-[#e7efe9] pb-5">
                <p className="font-serif text-3xl text-[#10241f]">Amaka Adeyemi</p>
                <p className="mt-1 text-sm font-medium text-primary">Product designer</p>
                <p className="mt-2 text-xs tracking-wide text-[#6b7f78]">Lagos · amaka@email.com · +234 800 000 0000</p>
              </div>
              <div className="mt-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6b7f78]">Summary</p>
                <p className="mt-2 text-sm leading-6 text-[#3d524c]">
                  Designs hiring products used by students and early-career teams. Turns messy experience into a one-page story recruiters can scan.
                </p>
              </div>
              <div className="mt-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6b7f78]">Experience</p>
                <div className="mt-2 flex items-baseline justify-between gap-4">
                  <p className="text-sm font-semibold">Northwind Studio</p>
                  <p className="text-xs text-[#6b7f78]">2022 — Present</p>
                </div>
                <p className="text-sm text-[#3d524c]">Product designer</p>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {['Figma', 'Research', 'React', 'Writing'].map((skill) => (
                  <span key={skill} className="rounded-full bg-[#e7f3ef] px-3 py-1 text-xs font-medium text-[#0f6b5e]">
                    {skill}
                  </span>
                ))}
              </div>
            </article>
          </div>
        </section>

        <section className="border-y border-primary/10 bg-white">
          <div className="mx-auto max-w-6xl px-5 py-20">
            <div className="max-w-2xl">
              <h2 className="font-serif text-4xl text-[#10241f]">Three steps, then a finished CV.</h2>
              <p className="mt-3 text-[#3d524c]">The same path the builder uses, from the first form to a match against real openings.</p>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {steps.map((step, index) => (
                <article key={step.title} className="rounded-3xl border border-[#e4eee8] bg-[#f7faf8] p-7">
                  <div className="flex items-center justify-between">
                    <step.icon className="h-5 w-5 text-primary" />
                    <span className="font-serif text-2xl text-[#b7cdc4]">0{index + 1}</span>
                  </div>
                  <h3 className="mt-8 text-lg font-semibold text-[#10241f]">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#3d524c]">{step.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-10 px-5 py-20 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <h2 className="font-serif text-4xl leading-tight text-[#10241f]">Built for the page a recruiter actually reads.</h2>
            <p className="mt-4 text-[#3d524c]">
              One template, a color you choose, and a public link you can print or share. The match view tells you which required skills are already on the CV.
            </p>
          </div>
          <dl className="grid gap-4 sm:grid-cols-3">
            {[
              ['01', 'Live preview', 'See the page update as you type each section.'],
              ['02', 'AI drafts', 'Start from a summary or bullets, then rewrite them in your voice.'],
              ['03', 'Match score', 'A percentage, the skills you have, and the ones to add.'],
            ].map(([number, title, text]) => (
              <div key={number} className="rounded-3xl bg-white p-5 shadow-[0_1px_0_rgba(16,36,31,0.04)]">
                <dt className="font-serif text-3xl text-primary">{number}</dt>
                <dd className="mt-4 text-sm font-semibold text-[#10241f]">{title}</dd>
                <dd className="mt-2 text-sm leading-6 text-[#3d524c]">{text}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="px-5 pb-20">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 rounded-[32px] bg-[#123f38] px-8 py-12 text-white sm:px-12 lg:flex-row lg:items-center">
            <div>
              <h2 className="font-serif text-4xl">Start with the role in mind.</h2>
              <p className="mt-3 max-w-xl text-[#d5e6e0]">Open the dashboard, name the resume, and fill the first section. You can match it to vacancies after your skills are saved.</p>
            </div>
            <Link
              to="/dashboard"
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#123f38]"
            >
              Get started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}

export default Home
