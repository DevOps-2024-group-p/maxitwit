#!/bin/bash

# Step 1: Open database

sqlite3 ./minitwit.db << EOF

# Step 2: Set file output

.output ./data.sql

# Step 3: Rename some tables ()

alter table user rename to tempUser;

alter table tempUser rename to User;

alter table message rename to tempMessage;

alter table tempMessage rename to Message;

# Step 3: Extract data from database

.dump

EOF

# Step 4: Grep all lines starting with insert and output to file

grep "^INSERT" ./data.sql > extracted_data.sql

# Step 5: Modify INSERT statements to include double quotes around table names

sed 's/INSERT INTO \([A-Za-z_]*\) VALUES/INSERT INTO "\1" VALUES/g' extracted_data.sql > extracted_data_temp.sql
# Move the modified file back to extracted_data.sql
mv extracted_data_temp.sql extracted_data.sql

echo "Extraction completed. Data saved to extracted_data.sql"

