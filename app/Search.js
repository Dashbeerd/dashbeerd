'use client'
import { useState } from 'react'

export const Search = () => {
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <input type='text' placeholder='Search...' className='w-full p-2 border' value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
  )
}