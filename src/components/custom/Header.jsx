import React from 'react'
import { Button } from '../ui/button'
import { Link } from 'react-router-dom'

function Header() {
    return (
        <div className='sticky top-0 z-40 border-b border-primary/10 bg-background/80 backdrop-blur'>
            <div className='mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3'>
                <Link to={'/'}>
                    <img src='/logo.svg' className='cursor-pointer' width={100} height={100} alt='AI Resume Builder' />
                </Link>
                <div className='flex flex-wrap justify-end gap-2'>
                    <Link to={'/dashboard'}>
                        <Button variant="outline">Dashboard</Button>
                    </Link>
                    <Link to={'/jobs'}>
                        <Button variant="outline">Job Matches</Button>
                    </Link>
                    <Link to={'/admin'}>
                        <Button variant="outline">Admin</Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default Header
