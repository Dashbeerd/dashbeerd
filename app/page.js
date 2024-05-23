'use server'

import { db } from '@/utils/db';
import { BeerTable } from './BeerTable';

export async function searchBeers(searchTerm, sort = 'beername', order = 'ASC') {
  const validSortColumns = ['beername', 'brewername', 'beerstyle', 'beerabv', 'beeribu', 'website']
  const validOrder = ['ASC', 'DESC']

  // Ensure sort and order are valid
  const sortColumn = validSortColumns.includes(sort.toLowerCase()) ? sort.toLowerCase() : 'beername'
  const sortOrder = validOrder.includes(order.toUpperCase()) ? order.toUpperCase() : 'ASC'

  const hasSearchTerm = searchTerm && searchTerm.length > 0
  const params = hasSearchTerm ? [`%${searchTerm.toLowerCase()}%`] : []

  try {
    const { rows: beers } = await db.query(`
      SELECT beer.beerid, beer.brewername, beer.beername, beer.beerstyle, beer.beerabv, beer.beeribu, beer.website
      FROM catalog_beer.basicbeerdetails beer
      ${hasSearchTerm ? `WHERE LOWER(beer.beername) LIKE $1` : ''}
      ORDER BY ${sortColumn} ${sortOrder}
      LIMIT 100
    `, params)

    return beers

  } catch (error) {
    console.error('Error searching beers:', error)
    throw new Error('Error searching beers')
  }
}


const Page = async () => {
  const { rows: beers } = await db.query(`
  SELECT beer.beerid, beer.brewername, beer.beername, beer.beerstyle, beer.beerabv, beer.beeribu, beer.website
  FROM catalog_beer.basicbeerdetails beer
  ORDER BY beer.beername ASC
  LIMIT 100
`)

  return <BeerTable beers={beers} />
}
export default Page