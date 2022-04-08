---
author: Travis Hathaway
title: "Processing OpenStreetMap data with PostgreSQL and Python"
date: 2022-04-02
description: "Getting started with OpenStreetMap data can be an intimidating process. With so many data formats to choose from, how does one pick the correct one and get started? In this post, I guide you through one possible way to organise and process this data using PostgreSQL and Python."
featured_image: "/img/post_images/europe_karte"
featured_image_thumbnail: "/img/post_images/europe_karte_small"
show_featured_image: true
tags: [python, postgresql, openstreetmap]
layout: layouts/post.njk
feature_image_credits: ''
---

*This is meant to be a companion post to the talk I gave at PyConDE 2022. This post will still make sense even if you have not watched the talk, but I highly recommend checking it out.* 😉

<a href="https://travishathaway.com" class="external-service">
  <span>Click here to watch the talk</span>
  <i class="fa-brands fa-youtube fa-xl" style="color: var(--darkgray)"></i>
</a>

<hr />

## Background

In 2021, I set off to write my master thesis with the city of Kiel in Northern Germany as my object of study. I wanted to find out how accessible the city was by foot and in turn use this data as a justification for car-reduction measures ([read more about this project here](https://altmo.thath.net/)). To create this accessibility assessment, I was going to need data about where people lived and where all the common amenities in the city were.

The OpenStreetMap project provided an answer to this question. This data set covers the entire planet and is constantly growing. Accuracy for this data set varies between countries, but for Germany, where I was going to base my study, the data quality is very high with plenty of detailed information available for German cities.

In order to sift through this data and come up with a meaningful analysis, I was also going to need a way to organize this project. This is where PostgreSQL and Python came into play. From the outset, I decided that PostgreSQL with its PostGIS extension was going to be the "data warehouse" for the project. For organizing the running of queries and generating reports, I would use Python to glue everything together.

I learned quite a bit from this process and now want to report everything I learned to hopefully benefit you the reader. Therefore, in this post, I will be giving you everything I wish I had at the beginning of this analysis, including:

- [OSM data overview (including data types of tags)](#osm-overview)
- [OSM data in PostgreSQL/PostGIS](#postgis-overview)
- [How do we import this data?](#osm-data-import)
- [Other tools for processing OSM data](#osm-other-tools)
- [Python example project](#python-example-project)

*Want to just see the code? The link below will send you to an example project I created utilizing everything I talk about in this article:*

<a href="https://github.com/travishathaway/talks/tree/main/processing_osm_data_with_postgres_and_python"
  class="external-service">
  <span>Check out it on GitHub</span>
  <i class="fa-brands fa-github-square fa-xl" style="color: #24292f"></i>
</a>

<hr />


## <a id="osm-overview"></a>OSM data overview

Data in OSM is organized in a hierarchical manner, and there are three basic types of data: nodes, ways and relations. Nodes lie at the bottom of the hierarchy and can be used to represent things which occupy a single point in space. These are often things such benches, waste baskets or bus stops.

As head higher up this hierarchy, we meet the next data type: ways. Ways are connections or two or more nodes. When they do not close on themselves we call these "open ways" (i.e. lines), and when they do close in on themselves, we call the closed ways (circles) or areas (polygons). Examples of these data types include things like roads, streams (both open ways), roundabouts (closed way), or political boundaries (areas).

The data type to discuss is a relation. Relations provide a way to arbitrarily nest and group ways and nodes together. For example, a bus route may include a collection of open ways representing streets. This data type in particular allows us to describe the sometimes complex relationships that our physical world has. Also, falling into this category are lakes with islands and buildings with central courtyards (i.e. donut shaped things).

## <a id="postgis-overview"></a>OSM data in PostgreSQL/PostGIS

Luckily, PostGIS represents its data type in much the same way, except for the fact that it uses a slightly different naming scheme. In PostGIS nodes are represented use the `Point` geometry type, while ways can be either represented as `Linestring` or `Polygon`. To represent relations, PostGIS has a variety of `Multi*` data types (e.g. `MultiPolygon`). All of these data types inherit from a root `Geometry` type, which can be used to store any geometry type (see figure for more details).

## <a id="osm-tags"></a>Tags in OSM

The tagging system is incredibly important to OSM as this is what allows it to neatly categorize all of its wonderful data. At its heart, it is a simple key, value store, and the system itself is very flexible as it allows contributors to create any key, value pairs they wish. But, at the same time, the community does maintain informal standards for appropriate tag values, which makes the system much more reliable and predictable.

One very common tag in OSM is [amenity](https://wiki.openstreetmap.org/wiki/Key:amenity). This includes various attractions or generally places you might enjoy going to. Here are some example values:

- Cinema
- Pub
- Restaurant
- Library

Other examples include [landuse](https://wiki.openstreetmap.org/wiki/Key:landuse) which has values such as commercial, residential, farmland and [building](https://wiki.openstreetmap.org/wiki/Key:building) with values such as apartments, house and hotel.

In order to see the full variety of tags already in use, [head to the OSM Wiki's tags page](https://wiki.openstreetmap.org/wiki/Map_features). There's also [Taginfo](https://taginfo.openstreetmap.org/) for getting exact counts on how many features have a particular tag.

## <a id="osm-data-import"></a>How do we import this data?

Importing this data into PostgreSQL is made possible through a variety of toolsets ([check them all out here](https://wiki.openstreetmap.org/wiki/PostgreSQL)), but in this article, I am going to introduce you to `osm2pgsql`. This is a tool capable of importing OSM data in a very generic way, but it also has options which allow you to highly customize the import.

For example, it is possible to import OSM data using custom Lua scripts. Below is an example of such a script:

```lua
-- Holds all the database tables you may want to define
local tables = {}

-- Tell the import script what the table should look like
-- and what columns to include.
tables.amenity_points = osm2pgsql.define_node_table('amenity_points', {
    { column = 'type', type = 'text' },
    { column = 'tags', type = 'jsonb' },
    { column = 'geom', type = 'geometry', projection = 3857 },
})

-- This function gets called during the import process and runs
-- for each node. There are others for processing `ways` and
-- `relations`.
function osm2pgsql.process_node(object)
    if object.tags.amenity or object.tags.shop then
        tables.amenity_points:add_row({
          type = object.tags.amenity,
          tags = object.tags,
          geom = { create = 'point' }
        })
    end
end
```

If you want to see some more good examples of using Lua scripts to import OSM data checkout the following links:

- [PgOSM Flex](https://github.com/rustprooflabs/pgosm-flex) 👈 *tons of great Lua examples, plus a base Docker image you can use.*
- [osm2pgsql.org's example page](https://osm2pgsql.org/examples/) 👈 *example use cases and detailed documentation on the flex format*

## <a id="osm-other-tools"></a>Other tools for processing OSM data

Other than `osm2pgsql`, another great tool for working with OSM data is `osmium`. This CLI tool can be thought of as the swiss army knife for OSM data as it can perform diffs, extracts and filters among other things. Using this tool for extracts can be very useful when filtering large OSM datasets. The following example shows how we can use bounding boxes to extract a subset from a larger data file:

```bash
# Bounding box format: min_lon, min_lat, max_lon, max_lat

osmium extract \
  --bbox -123.3,45.1,-122.1,45.8 \
  --output portland-metro-area.osm.pbf \
  us-west-latest.osm.pbf
```

This will extract all the data for the Greater Portland Metro Area in the U.S. Using extracts this way can be especially practical when the area you want data for spans state boundaries. The Greater Portland Metro Area actually extends into Washington, so an extract of either Oregon or Washington alone would not suffice. Instead, it's easier to download a larger area first (i.e. `us-west-latest`) and then performing an extract based on a bounding box.

On top of extracting, `osmium` can also provide a way to quickly filter OSM datasets by tag. The following example retrieves everything in the data set where the amenity tag is not null:

```bash
osmium tags-filter \
  --output portland-metro-amenities.osm.pbf \
  portland-metro-area.osm.pbf \
  amenity
```

For a full list of these commands, go check out the [osmium documentation](https://docs.osmcode.org/osmium/latest/).

## <a id="python-example-project"></a>Python example project

We've covered just about everything you need to know concerning importing OSM data to your PostgreSQL database and getting it ready for analysis. But, how do we organize this analysis? And how do we make sure that it's as easy as possible to share our work with others when they want to modify it or extend it? In this section, I'm going to walk you through one way to do this with Python by creating command line program similar to the ones used in the examples before.

But, before we start, let's give our project a purpose. Let's pretend that we have just won a contract with the *Trash Can Alliance of the Globe* (a trash can advocacy group, of course). They are interested in conducting research on trash cans in Germany and need to know the following:

- How many trash cans are located in the top 10 cities in Germany (by population)
- What's the trash can availability like in these cities? Which cities are the best and which are the worst?

Luckily, this a question that we can answer with the OSM data set. We can query everything with the tag `amenity = waste_basket` to find all the trash cans in Germany. Furthermore, we can use the administrative boundaries in OSM to count all the of the trash cans in a city. We'll compare these cities with each other by calculating a "Trash cans per square kilometer" metric.

### Implementation

Now the we have a game plan, we need to figure out how to implement it. Here's the general workflow we want:

<div style="text-align: center; margin-top: 2em; margin-bottom: 2em">
  <a href="./img/data-pipeline.png" title="Data pipeline chart">
    <img src="./img/data-pipeline.png" width="100%"/><br />
  </a>
  <span style="font-size: 0.8em">
    <b>Figure 1</b> <i>Data pipeline for our OSM data</i>
  </span>
</div>

We begin by downloading the data from [download.geofabrik.de](https://download.geofabrik.de) for the entirety of Germany (`germany-latest.osm.pbf`) and then extracting just the cities we care about. After this we have to import this into to PostgreSQL, while simultaneously organizing it into our preferred structure. Finally, we will need a way to generate reports and visualizations from this data.

To summarize, we have the following four operations we need to perform:

`Download` 👉 `Extract` 👉 `Import` 👉 `Report`

For downloading, we can use the `curl` command:

```bash
curl -O https://download.geofabrik.de/europe/germany-latest.osm.pbf
```

To extract the cities 