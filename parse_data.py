# Script to parse through PDF files and restructure strings

from os import path
from platform import DEV_NULL
import tabula
import csv
import json

# Check if parsed_data exists or not; if it doesn't generates csv data
if (path.exists('parsed_data.csv') == False):
    tabula.convert_into('dataset.pdf', 'parsed_data.csv', output_format='csv', pages='all')

# Parse csv into dictionary of string : string (address : additional comments format)

# initialize dictionary objects; rid_first skips first row (title)
address_dict = dict()
rid_first = 0

with open('parsed_data.csv', 'r') as file:
    read_data = csv.reader(file)
    for row in read_data:
        # skip first row
        if rid_first == 0:
            rid_first = 1
            continue

        # extract address and eliminate parenthesis
        address = row[3].partition('(')[0]

        #store address in array
        #address_array.append(address)
        
        # additional info in tuple format (개수, 비고)
        comments = row[4] + "개 설치, " + row[5]
        if (row[5] == ""):
            comments = "설치개수: " + row[4]
        address_dict[address] = comments

file.close()

# Writing Files to JSON for JS frontend to access
# indent = spacing/formatting
# ensure_ascii = False --> ensures that characters are not ASCII (does not corrupt Korean characters)

with open('address_dict.json', 'w', encoding="UTF8") as output_file:
    json.dump(address_dict, output_file, ensure_ascii=False, indent=2)
output_file.close()