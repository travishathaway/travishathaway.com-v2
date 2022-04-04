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

This is meant to be a compagnion post to the talk I gave at PyConDE 2022. With that being said, it is not important that you have already watched that talk to understand this post (although I would highly recommend checking it out first!)

## Background

In 2021, I set off to write my master thesis with the city of Kiel in Northern Germany as my object of study. I wanted to find out how accessible the city was by foot and in turn use this data as a justification for car-reduction measures. To create this accessibility assessment, I was going to need data about where people lived and where all the common amenities in the city were.

OpenStreetMap (OSM) provides this data free of cost, and I found this especially useful for conducting studies in Germany. Unlike where I am from (U.S.A which has many high quality public data resources), open data for German cities can be hard find. With this data in hand, I was ready to begin my analysis.

On top of this, I had a good idea about how 

In this post, I will be giving you everything I wish I had at the beginning of this analysis, including:

- Overview of OSM data types
- How does this 


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