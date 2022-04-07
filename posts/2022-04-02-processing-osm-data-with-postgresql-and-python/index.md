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
</a>

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

All of the examples I reference here can be found on GitHub:

<a href="https://github.com/travishathaway/talks/tree/main/processing_osm_data_with_postgres_and_python"
  class="external-service">
  <span>Check out it on GitHub</span>
  <i class="fa-brands fa-github-square fa-2x" style="color: #24292f"></i>
</a>


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



## <a id="osm-other-tools"></a>Other tools for processing OSM data

Oh Hai!

## <a id="python-example-project"></a>Python example project

Oh Hai!

`TOC Should be here`

- Intro
  - Why am I writing this article?
    - Explain how to structure Python/PostgreSQL projects when working with OSM data
    - Provide all the information I wish I had when I was starting
  - OSM Data
     - what are the different data types?
      - Nodes
      - Ways (closed ways, open ways, polygons)
      - Relations
    - How are the categorized?
      - Tags
        - taginfo
        - OSM Wiki for finding out more about tags
  - PostgreSQL/PostGIS
    - What is PostGIS
      - Extension that can help you manage and query geographic information
    - Types
      - Points, MultiPoint
      - LineString, MultiLineString
      - Polygon, MultiPolygon
  - Tools for importing this data into PostgreSQL
    - osmium:
      - Swiss army knife for OSM data
    - osm2pgsql:
      - importing tool that allows flexible imports with Lua scripts
  - Projects with Python
    - Initial structure
    - Why command line interfaces are good