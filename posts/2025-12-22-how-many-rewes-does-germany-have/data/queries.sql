-- Counting REWEs in Germany

select * from osm.poi_polygon where name ilike 'rewe%'
	and name not ilike '%to go' 
	and name not ilike '%express'
	and name not ilike '%getränke%'
	and osm_type = 'shop';

WITH rewes AS (
	SELECT 
		poly.name,
		ST_Centroid(poly.geom)
	FROM
		osm.poi_polygon poly
	WHERE 
		name ilike 'rewe%'
	AND name NOT ilike '%to go' 
	AND name NOT ilike '%express'
	--AND name NOT ilike '%getränke%'
  	AND name NOT ilike '%abhol%'
	aND osm_type = 'shop'
	aND osm_subtype = 'supermarket'

	UNION

	SELECT
		pt.name,
		pt.geom
	FROM
		osm.poi_point pt
	WHERE
		name ilike 'rewe%'
	AND name NOT ilike '%to go' 
	AND name NOT ilike '%express'
	AND name NOT ilike '%getränke%'
	--AND name NOT ilike '%abhol%'
	AND osm_type = 'shop'
	AND osm_subtype = 'supermarket'
)

-- Reference value is about 3.800
-- https://www.rewe-group.com/de/unternehmen/struktur-und-vertriebslinien/rewe/
SELECT distinct name FROM rewes;


WITH rewes AS (
	SELECT 
		poly.name,
		ST_Centroid(poly.geom) as geom
	FROM
		osm.poi_polygon poly
	WHERE 
		name ilike 'rewe%'
	AND name NOT ilike '%to go' 
	AND name NOT ilike '%express'
	--AND name NOT ilike '%getränke%'
  	AND name NOT ilike '%abhol%'
	aND osm_type = 'shop'
	aND osm_subtype = 'supermarket'

	UNION

	SELECT
		pt.name,
		pt.geom as geom
	FROM
		osm.poi_point pt
	WHERE
		name ilike 'rewe%'
	AND name NOT ilike '%to go' 
	AND name NOT ilike '%express'
	AND name NOT ilike '%getränke%'
	--AND name NOT ilike '%abhol%'
	AND osm_type = 'shop'
	AND osm_subtype = 'supermarket'
), states AS (
	SELECT 
		name,
		geom,
		ST_Area(geom) AS area
	FROM
		osm.place_polygon_nested
	WHERE 
		nest_level = 2 AND admin_level <=4
), pop AS (
	SELECT
		name,
		sum(einwohner) as population 
	FROM
		zensus.bevoelkerungszahl_100m b
	JOIN
		states s
	ON
		ST_Within(b.geom, s.geom)
	GROUP BY
		s.name
)
SELECT
	s.name,
	COUNT(*) AS rewes,
	p.population,
	round((s.area / 1000000)::NUMERIC, 2),
	round((COUNT(*) / (s.area / 1000000))::NUMERIC, 4) AS rewes_per_kilometer,
	(p.population / 10000.0) / COUNT(*) as rewes_per_10k
FROM
	states s
JOIN
	rewes r
ON
	ST_Within(r.geom, s.geom)
JOIN
	pop p
ON
	p.name = s.name
GROUP BY
	s.name, s.area, p.population;


-- How many people in Germany live within 1 km of a REWE?

with rewes as (
	select 
		poly.name,
		ST_Centroid(poly.geom) as geom
	from
		osm.poi_polygon poly
	where 
        name ~* '^rewe'
        AND name !~* '(to go|express|getränke|abhol)'	and 
		poly.osm_type = 'shop'

	UNION

	select
		pt.name,
		pt.geom as geom
	from
		osm.poi_point pt
	where
        name ~* '^rewe'
        AND name !~* '(to go|express|getränke|abhol)'	and
		pt.osm_type = 'shop'
), rewe_buffer as (
	select ST_Buffer(r.geom, 1300) as geom from rewes r
)
select
	sum(p.einwohner),
	ST_Union(b.geom)
from
	zensus.bevoelkerungszahl_100m p
join
	rewe_buffer b
on
	ST_Within(p.geom, b.geom);





WITH rewes AS (
    SELECT
        ST_Centroid(poly.geom) as geom
    FROM osm.poi_polygon poly
    WHERE
        name ~* '^rewe'
        AND name !~* '(to go|express|getränke|abhol)'
        AND osm_type = 'shop'
        AND osm_subtype = 'supermarket'
    UNION ALL
    SELECT geom
    FROM osm.poi_point pt
    WHERE
        name ~* '^rewe'
        AND name !~* '(to go|express|getränke|abhol)'
        AND osm_type = 'shop'
        AND osm_subtype = 'supermarket'
),
states AS (
    SELECT
        name,
        geom
    FROM osm.place_polygon_nested
    WHERE nest_level = 2 AND admin_level <= 4
),
-- Pre-filter population cells by state (much faster)
pop_by_state AS (
    SELECT
        s.name as state_name,
        p.geom,
        p.einwohner
    FROM zensus.bevoelkerungszahl_100m p
    JOIN states s ON ST_Intersects(p.geom, s.geom)
),
rewe_buffer AS (
    SELECT
        s.name,
        ST_SimplifyPreserveTopology(
            ST_Union(ST_Buffer(r.geom::geography, 1300)::geometry),
            10  -- tolerance in meters, adjust as needed
        ) as geom
    FROM rewes r
    JOIN states s ON ST_DWithin(r.geom, s.geom, 1300)
    GROUP BY s.name
)

SELECT
    r.name,
    SUM(p.einwohner) as total_einwohner,
    r.geom
FROM rewe_buffer r
JOIN pop_by_state p ON p.state_name = r.name 
    AND ST_Intersects(p.geom, r.geom)
GROUP BY r.name, r.geom;


WITH rewes AS (
    SELECT
        ST_Centroid(poly.geom) as geom
    FROM osm.poi_polygon poly
    WHERE
        name ~* '^rewe'
        AND name !~* '(to go|express|getränke|abhol)'
        AND osm_type = 'shop'
        AND osm_subtype = 'supermarket'
    UNION ALL
    SELECT geom
    FROM osm.poi_point pt
    WHERE
        name ~* '^rewe'
        AND name !~* '(to go|express|getränke|abhol)'
        AND osm_type = 'shop'
        AND osm_subtype = 'supermarket'
), states AS (
	SELECT 
		name,
		geom,
		ST_Area(geom) AS area
	FROM
		osm.place_polygon_nested
	WHERE 
		nest_level = 2 AND admin_level <=4
),
states_pop AS (
	SELECT
		name,
		sum(einwohner) as population 
	FROM
		zensus.bevoelkerungszahl_100m b
	JOIN
		states s
	ON
		ST_Within(b.geom, s.geom)
	GROUP BY
		s.name
),
rewe_buffer AS (
    SELECT
        ST_Union(ST_Buffer(r.geom, 1300)) as geom
    FROM rewes r
    WHERE ST_Within(r.geom, (
        SELECT geom FROM osm.place_polygon_nested 
        WHERE name = 'Berlin' AND nest_level = 2 AND admin_level <= 4
    ))
)
SELECT
    'Berlin' as state,
    SUM(p.einwohner) as pop_near,
	s.population
FROM rewe_buffer r
JOIN zensus.bevoelkerungszahl_100m p 
ON p.geom && r.geom
JOIN states_pop s
ON s.name = 'Berlin'
AND ST_Intersects(p.geom, r.geom)
GROUP BY s.population;

-- This query runs in about 3 minutes
-- This is the one I used to measure accessibility for the blog post
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
WITH rewes AS (
    SELECT
        ST_Centroid(poly.geom) as geom
    FROM osm.poi_polygon poly
    WHERE
        name ~* '^rewe'
        AND name !~* '(to go|express|getränke|abhol)'
        AND osm_type = 'shop'
        AND osm_subtype = 'supermarket'
    UNION ALL
    SELECT geom
    FROM osm.poi_point pt
    WHERE
        name ~* '^rewe'
        AND name !~* '(to go|express|getränke|abhol)'
        AND osm_type = 'shop'
        AND osm_subtype = 'supermarket'
), states AS (
	SELECT 
		name,
		geom,
		ST_Area(geom) AS area
	FROM
		osm.place_polygon_nested
	WHERE 
		nest_level = 2 AND admin_level <=4
),
states_pop AS (
	SELECT
		name,
		sum(einwohner) as population 
	FROM
		zensus.bevoelkerungszahl_100m b
	JOIN
		states s
	ON
		ST_Within(b.geom, s.geom)
	GROUP BY
		s.name
),
rewe_buffer AS (
    SELECT
		s.name,
		ST_SimplifyPreserveTopology(
        	ST_Union(ST_Buffer(r.geom, 1300)),
			50
		) as geom
    FROM rewes r
	JOIN
		states s
	ON
		s.geom && r.geom
	AND
		ST_Within(r.geom, s.geom)
	GROUP BY s.name
)
SELECT
    s.name,
    SUM(p.einwohner) as pop_near,
	s.population,
	SUM(p.einwohner)::NUMERIC / s.population::NUMERIC as percent_near
FROM rewe_buffer r
JOIN zensus.bevoelkerungszahl_100m p 
ON p.geom && r.geom
AND ST_Intersects(p.geom, r.geom)
JOIN states_pop s
ON s.name = r.name
GROUP BY s.name, s.population;
