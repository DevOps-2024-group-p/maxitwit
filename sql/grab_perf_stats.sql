-- run against production to get performance statistics

-- mkdir -p /out
-- psql -d <dbname> -h <host> -p <port> -q -U <user> -W --set=sslmode=require \
-- set=sslrootcert=<path/to/ca-certificate.crt> \
-- < ./sql/grab_perf_stats.sql 2>&1 > out/out.txt

select * from pg_stat_user_tables;

select 
  schemaname,
  relname,
  seq_scan,
  seq_tup_read,
  seq_tup_read / seq_scan as avg,
  idx_scan
from pg_stat_user_tables
where seq_scan > 0
order by seq_tup_read desc limit 25;