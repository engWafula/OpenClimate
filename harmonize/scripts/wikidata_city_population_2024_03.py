import logging
import requests

apihost = None
INPUT_FILE = "../data/raw/wikidata-city-population-2024-03/wikidata-city-population.csv"
LOCODE_ACTOR_FILE = "../data/processed/UNLOCODE/Actor.csv"
OUTPUT_DIR = "../data/processed/OEF:WD:city-population:20240320"

PUBLISHER = {
    "id": "OEF:WD",
    "name": "Open Earth Foundation extracts from Wikidata",
    "URL": "https://github.com/Open-Earth-Foundation/OpenClimate-harmonize"
}

DATASOURCE = {
    "datasource_id": "OEF:WD:city-population:20240320",
    "name": "Wikidata extract of city objects and their populations",
    "publisher": PUBLISHER["id"],
    "published": "2024-03-20",
    "URL": "https://github.com/Open-Earth-Foundation/OpenClimate/"
}

TAGS = [
    {'tag_id': 'geo',
     'tag_name': 'geographical data'},
    {'tag_id': 'contextual',
     'tag_name': 'contextual data'},
    {'tag_id': 'population',
     'tag_name': 'population of an area'},
    {'tag_id': 'wikidata',
      'tag_name': 'data extracted from Wikidata'},
    {'tag_id': 'cc0',
     'tag_name': 'Creative Commons CC0 license'},
    {'tag_id': 'extract',
     'tag_name': 'Dataset extracted from a larger database'},
    {'tag_id': 'oef',
     'tag_name': 'Dataset from Open Earth Foundation'},
    {'tag_id': 'evanp',
     'tag_name': 'Dataset by Evan Prodromou'}
]

import csv

def read_actors(filename):
    actors = {}
    with open(filename, mode='r') as csvfile:
        reader = csv.DictReader(csvfile)
        actors = {row['actor_id']: row for row in reader}
    return actors

def slurp_file(name):
    data = []
    with open(name) as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            data.append(row)
    return data

def write_csv(name, rows):
    with open(f'{OUTPUT_DIR}/{name}.csv', mode='w') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=rows[0].keys())
        writer.writeheader()
        writer.writerows(rows)

cache = {}
session = requests.Session()
def is_actor_id(code):
    global session
    global cache
    if (code in cache):
        return cache[code]
    r = session.get(f'{apihost}/api/v1/search/actor?identifier={code}&namespace=UNLOCODE')
    if r.status_code != 200:
        raise Exception("Bad response")
    resp = r.json()
    logging.debug(resp)
    if not resp['success']:
        raise Exception("Bad response")
    cache[code] = True if len(resp['data']) > 0 else False
    logging.debug(f'{code} -> {cache[code]}')
    return cache[code]

def main():

    input = slurp_file(INPUT_FILE)
    actor_ids = read_actors(LOCODE_ACTOR_FILE)

    actor_identifiers = {}
    values = {}
    populations = []

    for row in input:

        actor_id = row['locode'][0:2] + ' ' + row['locode'][2:5]

        if not actor_id in actor_ids:
            logging.warning(f'skipping {actor_id}: no such actor')
            continue

        try:
            population = round(float(row['population']))
            year = int(row['populationYear'])
        except:
            logging.warning(f'skipping {actor_id}: invalid data: population -> {row["population"]}, year => {row["populationYear"]}')
            continue

        if actor_id not in actor_identifiers:
            qno = row['item'].replace('http://www.wikidata.org/entity/', '')
            actor_identifiers[actor_id] = {
                'actor_id': actor_id,
                'identifier': qno,
                'namespace': 'Wikidata',
                'datasource_id': DATASOURCE['datasource_id']
            }

        # Note: we may have years with multiple records

        if actor_id not in values:
            values[actor_id] = {}

        if year not in values[actor_id]:
            values[actor_id][year] = []

        values[actor_id][year].append(population)

    for id, years in values.items():
        for year, pops in years.items():
            populations.append({
                'actor_id': id,
                'population': max(pops), # FIXME: better check!
                'year': year,
                'datasource_id': DATASOURCE['datasource_id']
            })

    write_csv('Publisher', [PUBLISHER])
    write_csv('DataSource', [DATASOURCE])
    write_csv('Tag', TAGS)
    write_csv('DataSourceTag', list(map(lambda t: {'datasource_id': DATASOURCE['datasource_id'], 'tag_id': t['tag_id']}, TAGS)))
    write_csv('ActorIdentifier', list(actor_identifiers.values()))
    write_csv('Population', populations)

if __name__ == "__main__":
    import os
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('-A', '--api', help='API host prefix', default=(os.environ.get('OPENCLIMATE_API') or 'https://app.openclimate.network'))
    parser.add_argument('-d', '--debug', action='store_true', help='flag for running debug')
    args = parser.parse_args()

    apihost = args.api
    logging.basicConfig(level=logging.DEBUG if args.debug else logging.INFO)

    main()