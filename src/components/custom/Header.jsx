import React from 'react'
import { Button } from '../ui/button'
import { Link } from 'react-router-dom'

function Header() {
    return (
        <div className='p-3 px-5 flex justify-between shadow-md'>
             <Link to={'/dashboard'}>
            <img src='/logo.svg' className='cursor-pointer' width={100} height={100} />
            </Link>
            <div className='flex gap-2'>
                <Link to={'/dashboard'}>
                    <Button variant="outline">Dashboard</Button>
                </Link>
                <Link to={'/jobs'}>
                    <Button variant="outline">Job Matches</Button>
                </Link>
                <Link to={'/admin'}>
                    <Button>Admin</Button>
                </Link>
            </div>
        </div>
    )
}

export default Header
