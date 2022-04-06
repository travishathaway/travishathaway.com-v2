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

<div style="text-align: center">

[Click here to watch the talk](https://travishathaway.com)

</div>

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

All of the examples I reference here can be found at this:

<div style="text-align: center">
  <p>
    <a href="https://github.com/travishathaway/talks/tree/main/processing_osm_data_with_postgres_and_python">
      GitHub repository
    </a>
  </p>
</div>


## <a id="osm-overview"></a>OSM data overview

Oh Hai!

## <a id="postgis-overview"></a>OSM data in PostgreSQL/PostGIS

Oh Hai!

## <a id="osm-data-import"></a>How do we import this data?

Oh Hai!

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