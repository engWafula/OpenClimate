import logging

apihost = None
INPUT_FILE = "../data/raw/wikidata-subnational-population-2024-3/wikidata_subnational_population.csv"
OUTPUT_DIR = "../data/processed/OEF:WD:subnational-population:20240322"
ACTOR_FILE = "../data/processed/ISO-3166-2/Actor.csv"

PUBLISHER = {
    "id": "OEF:WD",
    "name": "Open Earth Foundation extracts from Wikidata",
    "URL": "https://github.com/Open-Earth-Foundation/OpenClimate-harmonize"
}

DATASOURCE = {
    "datasource_id": "OEF:WD:subnational-population:20240322",
    "name": "Wikidata extract of subnational objects and their populations for years since 1990",
    "publisher": PUBLISHER["id"],
    "published": "2024-03-22",
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

def read_actors(filename):
    actors = None
    with open(filename, 'r') as csvfile:
        reader = csv.DictReader(csvfile)
        actors = {row['actor_id']: row for row in reader}
    return actors

def ensure_dir(dirname):
    import os
    if not os.path.exists(dirname):
        os.makedirs(dirname)

def main():

    actors = read_actors(ACTOR_FILE)

    input = slurp_file(INPUT_FILE)

    actor_identifiers = {}
    values = {}
    populations = []


    for row in input:

        actor_id = row['iso31662']
        population = round(float(row['population']))
        year = int(row['populationYear'])

        if not actor_id in actors:
            logging.info(f'skipping {actor_id}')
            continue
        else:
            logging.info(f'processing {actor_id}')

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

    ensure_dir(OUTPUT_DIR)

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
    parser.add_argument('-A', '--api', help='API host prefix', default=(os.environ.get('OPENCLIMATE_API') or 'https://openclimate.network'))
    parser.add_argument('-d', '--debug', action='store_true', help='flag for running debug')
    args = parser.parse_args()

    apihost = args.api
    logging.basicConfig(level=logging.DEBUG if args.debug else logging.INFO)

    main()