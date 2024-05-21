'use client'

import { useEffect, useState } from 'react'
import { searchBeers } from './page'

const ColumnHeader = ({ name, displayed, sort, changeSort }) => {
  const className = sort === name ? 'font-bold' : 'font-normal'
  return (
    <p className={className} onClick={() => changeSort(name)}>{displayed}</p>
  )
}

export const BeerTable = ({ beers: allBeers }) => {
  const [beers, setBeers] = useState([])
  const [sort, setSort] = useState('beername')
  const [order, setOrder] = useState('ASC')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const getBeers = async () => {
      const res = await searchBeers(searchTerm, sort, order);
      setBeers(res);
    }
    getBeers()
  }, [searchTerm, sort, order]);

  const changeSort = async (sort) => {
    setSort(sort)
    setOrder(order === 'ASC' ? 'DESC' : 'ASC')
  }


  return (
    <div className='p-2'>
    <h1 className='text-4xl font-bold p-2'>🍻 Beers!</h1>
    <input type='text' placeholder='Search...' className='w-full p-2 border' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
    <div className='hidden sm:grid sticky top-0 bg-white w-full grid-cols-1 sm:grid-cols-5 gap-2 border-b p-2'>
      <ColumnHeader name='beername' displayed='Name' sort={sort} changeSort={changeSort} />
      <ColumnHeader name='brewername' displayed='Brewery' sort={sort} changeSort={changeSort} />
      <ColumnHeader name='beeribu' displayed='IBU' sort={sort} changeSort={changeSort} />
      <ColumnHeader name='beerabv' displayed='ABV' sort={sort} changeSort={changeSort} />
      <ColumnHeader name='beerstyle' displayed='Style' sort={sort} changeSort={changeSort} />

    </div>
    {beers.map(beer => (
      <div className='w-full grid grid-cols-1 sm:grid-cols-5 gap-2 border-b p-2' key={beer.beerid}>
        <p className='font-bold'>{beer.beername}</p>
        <a href={beer.website} className='text-blue-500 underline'><p>{beer.brewername}</p></a>
        <p>{beer.beeribu}</p>
        <p>{beer.beerabv}%</p>
        <p>{beer.beerstyle}</p>
      </div>
    ))}
  </div>
  )
}