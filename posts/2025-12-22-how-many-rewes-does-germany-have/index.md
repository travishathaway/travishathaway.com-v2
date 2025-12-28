---
author: Travis Hathaway
title: "How Many REWEs Does Germany Have?"
date: 2025-12-21
description: In this post, I use OpenStreetMap and German Census data to answer this question and more. I show you how I used PostgreSQL and PostGIS for the analysis plus there will be some nice looking charts too 😍 📊 🌍.
featured_image: "/img/post_images/how-many-rewes-does-germany-have"
featured_image_thumbnail: "/img/post_images/how-many-rewes-does-germany-have-800"
show_featured_image: true
tags: [gis, urban geography, openstreetmap, postgresql]
layout: layouts/post_with_plots.njk
custom_css: "posts/2025-12-22-how-many-rewes-does-germany-have/graphs.css"
custom_js: "posts/2025-12-22-how-many-rewes-does-germany-have/graphs.js"
feature_image_credits: '
  <div style="font-size: 0.8em; margin-bottom: 2em">
    <i>
    Photo by <a href="https://unsplash.com/de/@franki?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Franki Chamaki</a> on <a href="https://unsplash.com/de/fotos/weiss-rot-beschriftete-packung-auf-weissem-regal-ivfp_yxZuYQ?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
    </i>
  </div>'
---

REWE (_pronounced: RAY-veh_) is one of the largest supermarket chains in Germany, and according to their [official website](https://www.rewe-group.com/de/unternehmen/struktur-und-vertriebslinien/rewe/), they have over 3,800 locations country-wide. But, I wouldn't be writing this blog post just to answer this simple question. Instead, I am going to show how you can derive this answer completely from volunteer contributed data via [OpenStreetMap][osm]. To make this more interesting, I bring in [German Census][de-statis] and see what other questions I can answer.

---

### Prerequisites

To follow along with this blog post, you need to do the following:

1. Create local PostgreSQL database using the [PgOSM Flex][pg-osm-flex] project (requires Docker).
2. Import German Census data into this database using [zensus2pgsql][zensus2pgsql].

<div class="callout callout-info">
  <strong>Good to know:</strong> "zensus2pgsql" is a tool I wrote myself and is still early in development. If you have any feedback for me about this tool, please create an issue on the <a href="https://github.com/travishathaway/zensus2pgsql">GitHub project</a>
</div>

---

### What exactly is a _REWE_?

This may sound like an obvious question, but it actually isn't. REWEs in Germany come in several shapes and sizes. Some are traditional full service supermarkets while others are simply express stores and drink markets. For this post, I focus on just the full service supermarkets because they're more likely what most people in Germany think of when they think of REWE.

With this assumption in mind, let's write a SQL query that can count all the REWE stores in Germany:

```sql
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
```

| Total REWEs |
|-------------|
| 3,750       |


This value lines up well with the value I got from the source I linked to earlier, so it looks like I did a pretty good job. I went back and forth a couple times to get it right though, so I encourage you to always inspect the rows you get back to make sure everything looks correct (i.e. instead of `COUNT(*)` return `DISTINCT name` to inspect individual names of stores). If you notice anything wrong with the data (like typos), I encourage you to fix these yourself on [openstreetmap.org](https://openstreetmap.org).


### Which federal state has the most?

To make this more interesting, let's figure out which federal state has the most REWEs.  To make sure states with higher populations don't have an unfair advantage, we use a per-capita measurement (REWEs per 10k inhabitants) for our comparison.

Here's a query that uses both our OpenStreetMap and census data to calculate per-capita REWEs:

```sql
WITH rewes AS(
  -- snip, snip ✂️ (same as example from above)
), states AS (
	SELECT 
		name,
		geom
	FROM
		osm.place_polygon_nested -- Administrative boundaries
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
	COUNT(*) / (p.population / 10000.0) as rewes_per_10k
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
```

Now we can take this data and visualize it on a map:

<div class="map-container">
	<h4 class="graph-title">Statistics about REWEs in Germany</h4>
	<div data-source="data/rewe-data.json" class="map"></div>
</div>

**Hessen** is the clear winner and can be declared the REWE capital of Germany at about `0.74` REWEs per 10k inhabitants with **Sachsen-Anhalt** coming in last at `0.25`. A further analysis might focus on all supermarket chains and what the market share looks like for each state.

### Which federal state has the most accessible REWEs?

The final question deals with accessibility, and by this, I mean how easily these REWEs can be reached. But, how exactly should this be measured? One way is by using the [15-minute city urban planning concept][15-minute-city] that states most amenities in a city are ideally reachable within 15 minutes by walking, biking or public transit. So, with this in mind let's see how many people in Germany live within 1.3km (about 15 minutes of walking) of a REWE.

To do this, I use the `ST_Buffer` function in PostGIS to draw a 1.3km buffer around all the the REWEs in Germany and then see how many people live within this buffer. I also split this up by state to compare them by the percentage of the population living within 1.3km of a REWE:

```sql
WITH rewes AS (
  -- snip, snip ✂️ (same as example from above)
), states AS (
  -- snip, snip ✂️ (same as example from above)
), state_pop AS (
  -- snip, snip ✂️ (same as example from above)
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
JOIN state_pop s
ON s.name = r.name
GROUP BY s.name, s.population;
```

With this data we can create the following map:

<div class="map-container">
  <h4 class="graph-title">REWE accessibility in Germany</h4>
  <div 
    data-source="data/rewe-accessibility.json" 
    data-metrics="percent_near,pop_near"
	data-default-metric="percent_near"
    class="map">
  </div>
</div>

Upon seeing this, one thing that immediately stood out to me was how high the percentages are for **Bremen**, **Hamburg** and **Berlin** at **63.9%**, **72.3%** and **78.3%**, respectively. All three of these states are highly urban and that's most likely why a very high percentage of their population lives so close to REWEs. For further analysis, I would split up Germany into rural and urban zones to more fairly compare areas with each other and look for interesting discrepancies between them and find out why they exist.

## Conclusion

With this post, I wanted to give you all some inspiration for what types of data analysis are possible by combining OpenStreetMap and the German Census. There are many more areas you can investigate, and in the coming months I plan on doing just that. My goal in the coming year will be to write at least one more essay that I can add to my [essay series][essays]. Like those essays, this essay will situate itself within ongoing research in Urban Studies and Urban Geography, so stay tuned!

[de-statis]: https://www.destatis.de/DE/Home/_inhalt.html
[osm]: https://openstreetmap.org
[15-minute-city]: https://www.nature.com/articles/s41599-022-01145-0
[pg-osm-flex]: https://pgosm-flex.com/
[zensus2pgsql]: https://travishathaway.github.io/zensus2pgsql
[essays]: /tags/essays/