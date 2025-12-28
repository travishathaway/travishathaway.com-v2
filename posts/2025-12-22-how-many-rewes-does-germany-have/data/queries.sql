-- Count all REWEs in Germany
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
)

SELECT COUNT(*) FROM rewes;

-- Calculate per capita REWEs per Bundesland

WITH rewes AS(
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
		geom
	FROM
		osm.place_polygon_nested -- Adminstrative boundaries
	WHERE 
		nest_level = 2 AND admin_level <=4
), state_pop AS (
	SELECT
		s.name,
		sum(einwohner) as population
	FROM
		zensus.bevoelkerungszahl_100m b -- Census data
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
	(p.population / 10000.0) / COUNT(*) as rewes_per_10k

FROM
	states s
JOIN
	rewes r
ON
	ST_Within(r.geom, s.geom)
JOIN
	state_pop p
ON
	p.name = s.name
GROUP BY
	s.name, p.population;


WITH rewes AS(
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
		geom
	FROM
		osm.place_polygon_nested -- Adminstrative boundaries
	WHERE 
		nest_level = 2 AND admin_level <=4
), state_pop AS (
	SELECT
		s.name,
		sum(einwohner) as population
	FROM
		zensus.bevoelkerungszahl_100m b -- Census data
	JOIN
		states s
	ON
		ST_Within(b.geom, s.geom)
	GROUP BY
		s.name
), rewe_buffer AS (
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
JOIN state_pop s
ON s.name = r.name
GROUP BY s.name, s.population;