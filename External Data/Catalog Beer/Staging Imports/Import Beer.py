import requests
import base64
import psycopg2
from psycopg2.extras import execute_values
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Access environment variables
connection_uri = os.getenv('DASHBEERD_NEON_DB_URI_STAGING')
api_key = os.getenv('CATALOG_BEER_API_KEY')

# Connect to Neon DB
conn = psycopg2.connect(connection_uri)
cur = conn.cursor()

# Encode your API Key for Basic Auth
credentials = base64.b64encode(f'{api_key}:'.encode('utf-8')).decode('utf-8')
headers = {
    'Authorization': f'Basic {credentials}',
    'Accept': 'application/json'
}

# Function to fetch a list of beer IDs
def fetch_beer_ids(count=100):
    base_url = f'https://api.catalog.beer/beer?count={count}'
    try:
        response = requests.get(base_url, headers=headers, timeout=10)  # Set timeout to 10 seconds
        if response.status_code == 200:
            beers = response.json().get('data', [])
            beer_ids = [beer['id'] for beer in beers]
            return beer_ids
        else:
            print('Failed to retrieve beer IDs:', response.status_code)
            return []
    except requests.exceptions.Timeout:
        print('Request timed out. Please try again later.')
        return []
    except requests.exceptions.RequestException as e:
        print(f'An error occurred: {e}')
        return []

# Function to fetch detailed information for each beer by ID
def fetch_beer_details(beer_id):
    base_url = f'https://api.catalog.beer/beer/{beer_id}'
    try:
        response = requests.get(base_url, headers=headers, timeout=10)  # Set timeout to 10 seconds
        if response.status_code == 200:
            return response.json()
        else:
            print(f'Failed to retrieve details for beer ID {beer_id}:', response.status_code)
            return None
    except requests.exceptions.Timeout:
        print(f'Request timed out for beer ID {beer_id}. Please try again later.')
        return None
    except requests.exceptions.RequestException as e:
        print(f'An error occurred for beer ID {beer_id}: {e}')
        return None

# Fetch the list of beer IDs
beer_ids = fetch_beer_ids(count=100)

# Fetch detailed information for each beer
beers = [fetch_beer_details(beer_id) for beer_id in beer_ids]

# Filter out any None values
beers = [beer for beer in beers if beer is not None]

# Prepare data tuples for insertion
beer_data = [
    (
        beer.get('id'),
        beer.get('object'),
        beer.get('name'),
        beer.get('style'),
        beer.get('description'),
        beer.get('abv'),
        beer.get('ibu'),
        beer.get('cb_verified'),
        beer.get('brewer_verified'),
        beer.get('brewer').get('id') if beer.get('brewer') else None
    )
    for beer in beers
]

# Insert data into the database
execute_values(cur,
    """
    INSERT INTO catalog_beer.beer (id, object, name, style, description, abv, ibu, cb_verified, brewer_verified, brewer_id)
    VALUES %s
    ON CONFLICT (id) DO UPDATE SET
        object = EXCLUDED.object,
        name = EXCLUDED.name,
        style = EXCLUDED.style,
        description = EXCLUDED.description,
        abv = EXCLUDED.abv,
        ibu = EXCLUDED.ibu,
        cb_verified = EXCLUDED.cb_verified,
        brewer_verified = EXCLUDED.brewer_verified,
        brewer_id = EXCLUDED.brewer_id;
    """,
    beer_data
)
conn.commit()
print("Beer data inserted or updated successfully.")

# Close the connection
cur.close()
conn.close()
