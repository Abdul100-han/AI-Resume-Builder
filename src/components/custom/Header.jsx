import React from 'react'
import { Button } from '../ui/button'
import { Link } from 'react-router-dom'

function Header() {
    return (
        <div className='p-3 px-5 flex justify-between shadow-md'>
             <Link to={'/dashboard'}>
            <img src='/logo.svg' className='cursor-pointer' width={100} height={100} />
            </Link>
            <Link to={'/dashboard'}>
                <Button variant="outline">Dashboard</Button>
            </Link>
        </div>
    )
}

export default Header
