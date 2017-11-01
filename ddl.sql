create external table etuovi (
  id string,
  pdf string,
  'time' string,
  price int,
  vastike decimal,
  city string,
  slum string,
  area decimal,
  floor string
  )
  ROW FORMAT SERDE 'org.openx.data.jsonserde.JsonSerDe'
LOCATION 's3://etuovi.hahne.fi/json/';


CREATE EXTERNAL TABLE IF NOT EXISTS etuovi.etuovi (
  `id` string,
  `pdf` string,
  `time` string,
  `price` bigint,
  `vastike` double,
  `city` string,
  `slum` string,
  `area` double,
  `floor` string 
)
ROW FORMAT SERDE 'org.openx.data.jsonserde.JsonSerDe'
WITH SERDEPROPERTIES (
  'serialization.format' = '1'
) LOCATION 's3://etuovi.hahne.fi/json/'
TBLPROPERTIES ('has_encrypted_data'='false');