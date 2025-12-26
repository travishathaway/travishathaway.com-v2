---
author: Travis Hathaway
title: "How Many REWEs Does Germany Have?"
date: 2025-12-21
description: In this post, I use OpenStreetMap and German Census data to answer this question and more. I use PostgreSQL and PostGIS as the primary tool to answer these questions and there will be some nice looking charts too 😍 📊 🌍.
featured_image: "/img/post_images/how-many-rewes-does-germany-have"
featured_image_thumbnail: "/img/post_images/how-many-rewes-does-germany-have-800"
show_featured_image: true
tags: [gis, urban geography]
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

REWE (_pronounced: RAY-veh_) is a one of the largest supermarket chains in Germany, and according to their [official website](https://www.rewe-group.com/de/unternehmen/struktur-und-vertriebslinien/rewe/), they have over 3,800 locations country-wide. But, I wouldn't be writing an entire blog post just to answer this simple question. This is a post about using OpenStreetMap and German Census data to conduct exploratory data analysis. I'll walk you through how to calculate how many REWEs are in Germany plus answer some other interesting questions along the way.

---

### Background

I've previously written about [processing OpenStreetMap data](/posts/2022-04-02-processing-osm-data-with-postgresql-and-python/) and even included a [fun waste basket analysis](/posts/2022-04-02-processing-osm-data-with-postgresql-and-python/#report), but since then, things have changed and new data has become available, most notably the [2022 German Census](www.destatis.de/DE/Themen/Gesellschaft-Umwelt/Bevoelkerung/Zensus2022/_inhalt.html). For me, the most interesting part of this dataset is the [Zensus Atlas](https://atlas.zensus2022.de/) that gives detailed demographic data at a resolution of 100 meters (previously this was only offered at a 1 kilometer resolution).

<div class="callout callout-info">
  I liked th Zensus Atlas dataset so much that I even wrote a CLI tool for importing it into PostgreSQL. It's called <a href="https://travishathaway.github.io/zensus2pgsql/" title="Link to zensus2pgsql project documentation">zensus2pgsql</a>. Please check it out and leave star if you find it useful 🌟.
</div>

To run all the queries I show in this post, loaded up a database with the entire Germany dataset from GeoFabrik and imported all the census data with zensus2pgsql. If you want to, follow along with this post, check out the documentaion for [PgOSM Flex](https://pgosm-flex.com) and [zensus2pgsql](https://travishathaway.github.io/zensus2pgsql) first. Loading these datasets into PostgreSQL takes about fours. 

Here's a full list of the wonderful OSS projects that made this work possible:

- [PostgreSQL](https://www.postgresql.org/) with [PostGIS](https://postgis.net) extension 🐘 🌏 as our data storage.
- [PgOSM Flex](https://pgosm-flex.com/) and [zensus2pgsql](https://travishathaway.github.io/zensus2pgsql) - to import our data from various sources into PostgreSQL.
- [GeoFabrik](https://downloads.geofabrik.de) and [OpenStreetMap](https://openstreetmap.org ) as the primary data sources (I specifically used the [Germany](https://download.geofabrik.de/europe/germany.html) dataset from 2025-12-19 for this article)
- [Observable Plot](https://observablehq.com/plot/) as our primary visualization library.

So, now that we all of the preparation out of the way, let's figure out how many REWEs Germany has and see what other questions we can answer along the way.

---

### What exactly is a _REWE_?

This may sound like an obvious question, but it actually isn't. To me a REWE is a store offering a full selection of fruit, produce, baked goods and the rest of the essentials that one would expect to find in a full service supermarket. REWE complicates this assumption though because not all of their stores fit this description. For example, some may simply be drink markets while other are "express" convenience stores attached to gas stations.

Now, we take the assumption above and translate it to an SQL query that can find all the REWE stores in Germany. Here's what I came up with:

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


Nice, this value lines up well with the value I got from the source I linked to earlier, so it looks like I did a pretty good job with the query. I went back and forth a couple times to get it right though, so I encourage you to always inspect the rows you get back to make sure everything looks correct. If notice anything wrong with the data (like typos), I encourage you to fix these yourself by logging into [openstreetmap.org](https://openstreetmap.org).


### Which Bundesland has the most?

To make this a little more interesting, let's now figure out which Bundesland has the most REWEs. To make sure Bundeslands with higher populations aren't given a fair advantage, we use a per capita measurement.

Here's a query that uses both our OpenStreetMap and census data sets to calculate the desired statstics:

```sql
WITH rewes AS(
  -- snip, snip ✂️ (same as example from above)
)
states AS (
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
```

Now we can take this data and visualize it on a map:

<div class="map-container">
	<h4 style="margin: 5px">Statistics about REWEs in Germany</h4>
	<div data-source="data/rewe-data.json" class="map"></div>
</div>

We can see that **Sachsen-Anhalt** is the clear winner here followed closely by **Sachsen**. It might be interesting to why the number of REWEs is so high there, but that's a subject for a different blog post.

### Which Bundesland has the most accessible REWEs?

The final question we'll ask has to do with accessibility, and by this I mean how easily these REWEs can be reached. But, how exactly should we measure this? One way to do this is by using the [15-minute city urban planning concept][15-minute-city] that states most amenities in a city are ideally reachable within 15 minutes by walking, biking or public transit. So, with this in mind let's see how many people in Germany live witin 1.3km (about 15 minutes of walking) of a REWE.

To do this, we'll use the `ST_Buffer` function in PostGIS to draw a 1.3km buffer around all the the REWEs in Germany and then see how many people live within this buffer. We'll also split this up by Bundesland to again compare each other by the percentage of the population living within 1.3km of a REWE:

```sql
WITH rewes AS (
  -- snip, snip ✂️ (same as example from above)
),
state_pop AS (
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
  <h4 style="margin: 5px">REWE accessibility in Germany</h4>
  <div 
    data-source="data/rewe-accessibility.json" 
    data-metrics="percent_near,pop_near"
	data-default-metric="percent_near"
    class="map">
  </div>
</div>

Upon seeing this, one thing that immediately stuck out to me was how high the percentages are for Bremen, Hamburg and Berlin at 63.9%, 72.3% and 78.3%, respectively. All three of these Bundeslands are highly urban and that's mostly likely why a very high percentage their population live so close to REWEs.

Another thing I found interesting was that even though Sachsen-Anhalt has the highest per-captia of REWEs in Germany, it has the lowest accessibility of REWEs. This could be intersting to research further because I'm not sure why this is the case, but if I were to do so, I would first divide the Bundesland up into two categories: rural and urban. I have a feeling that the urban areas probably enjoy a similar accessibility to other cities in Germany and that their rural population is living further away from their REWEs.

## Conclusion



[15-minute-city]: https://www.nature.com/articles/s41599-022-01145-0