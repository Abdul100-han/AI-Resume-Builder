import React from 'react'
import { Button } from '../ui/button'
import { Link, useLocation } from 'react-router-dom'

const links = [
    { to: '/profile', label: 'Student Profile', match: (path) => path === '/profile' || path.startsWith('/profile/') },
    { to: '/dashboard', label: 'Dashboard', match: (path) => path === '/dashboard' || path.startsWith('/dashboard/') || path.startsWith('/my-resume/') },
    { to: '/jobs', label: 'Job Matches', match: (path) => path === '/jobs' || path.startsWith('/jobs/') },
    { to: '/admin', label: 'Admin', match: (path) => path === '/admin' || path.startsWith('/admin/') },
]

function Header() {
    const { pathname } = useLocation()

    return (
        <div className='sticky top-0 z-40 border-b border-primary/10 bg-background/80 backdrop-blur'>
            <div className='mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3'>
                <Link to={'/'}>
                    <img src='/logo.svg' className='cursor-pointer' width={100} height={100} alt='AI Resume Builder' />
                </Link>
                <div className='flex flex-wrap justify-end gap-2'>
                    {links.map((item) => {
                        const current = item.match(pathname)
                        return (
                            <Button key={item.to} asChild variant={current ? 'default' : 'outline'}>
                                <Link to={item.to} aria-current={current ? 'page' : undefined}>{item.label}</Link>
                            </Button>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default Header
