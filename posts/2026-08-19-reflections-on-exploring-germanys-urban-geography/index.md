---
author: Travis Hathaway
title: "Reflections on Exploring Germany's Urban Geography"
date: 2026-08-19
description: This year I had the honor of speaking at PyCon DE about methods I used to explore Germany's urban geography with OpenStreetMap and PostgreSQL. In this post, I reflect on my experience and share links to the presentation itself and supporting material.
featured_image: "/img/post_images/exploring-germanys-urban-geography"
featured_image_thumbnail: "/img/post_images/exploring-germanys-urban-geography_800"
show_featured_image: true
tags: [gis, python, postgresql, openstreetmap]
layout: layouts/post.njk
feature_image_credits: '
  <div style="font-size: 0.8em; margin-bottom: 2em">
    <i>
    Photo from PyCon DE
    </i>
  </div>'
---

Over the past four years, I've had the pleasure of speaking at PyCon DE three times. The last time I spoke at the conference in 2023 I focused on software architecture and presented about [making your Python applications plugin friendly][youtube-plugin-friendly]. This time around I wanted to return to using and teaching some of the methodologies I originally used in my [master thesis on auto reduction planning in Kiel][thesis]. To do this, I decided to conduct a spatial accessibility analysis of hospitals in Germany by relying on a variety of open data sources, including the 2022 German Census and OpenStreetMap.

I encourage you to watch the video in its entirety on YouTube and take a look at the supporting material (slides, GitHub project, etc.):

- [Exploring Germany's Urban Geography with Census and OpenStreetMap Data][youtube-exploring-germanys]
- [Project resources][project-resources]

For the remainder of this post, I'll talk more about the journey I took leading up to the talk and then about how I adapted it further for a workshop to teach the methodologies I used.

---

## The initial idea

At the end of last year, I began working on a tool for importing German Zensus Data into PostgreSQL called [zensus2pgsql][zensus2pgsql]. This was a fun project I created in my free time, and my first use of it was pairing with OpenStreetMap data to ask random questions like [how many REWEs Germany has][how-many-rewes]. This superficial data exploration left me wanting to embark on a little more ambitious project, and this is how the idea of conducting a spatial accessibility analysis for the entire country of Germany came to mind.

In my master thesis, I only focused on the city of Kiel. After completing that project, I always wanted to go even further and conduct an analysis for an entire country. Unfortunately, I never had enough time to devote to this after beginning my full-time job. But, at the beginning of this year, I reduced my working hours from 40 to 32 (five to four days a week) to make room for these types of projects. This extra day a week gave me just enough breathing room to make approaching a project like this possible without completely burning out.

## Challenges during the research

One of the challenges that I didn't address much during the talk was my use of routing engines. I initially wanted to use a solution that relied entirely on PostgreSQL, including the [pgRouting][pgrouting] extension. If you examine the code itself, you can see [artifacts from these attempts][ems-pgrouting]. While using an approach purely with pgRouting did work and created correct results, it was prohibitively slow. This was so slow that I would need to run the routing calculation for over a week to complete the analysis for the entire country. This led me to explore other options for routing engines, and luckily I found [openrouteservice][openrouting-service], which provided an order-of-magnitude performance improvement that allows the analysis to complete in 8 to 10 hours instead of 8 to 10 days.

The second challenge had to do with data visualization. For the web map I was building, I wanted the user to be able to click on individual census points for the entirety of Germany to get average distance and demographic data. At the highest level of resolution, this meant rendering nearly 3 million points. I first experimented with loading GeoJSON, but this was far too slow because I was attempting to load everything at once. At this point I turned to Mapbox Vector Tiles (MVT), which I had first learned about during the [FOSSGIS conference][fossgis]. The incremental data retrieval meant that everything functioned far more smoothly, and I was very satisfied with the final result.

The last challenge worth mentioning is something that often happens to me during projects like this: finding out that someone or some organization has already basically done exactly what you hoped to do. In this case it was the Statistisches Bundesamt of the German government and its [Krankenhaus Atlas][krankenhaus-atlas]. To be honest, I was happier that they published a map like this for everyone rather than being disappointed I wasn't the first to do so. Regardless, I persevered and took solace in the fact that the web map I was creating would look slightly better than theirs (thanks to MVT!). My web map would also be an open-source tool that people could pick apart and learn from themselves.

## Adapting it beyond PyCon DE

What came after the conference was probably just as exciting as the work beforehand. While working with OSM data in PostgreSQL, my primary tool had been something called [pgosm-flex][pgosm-flex]. While this tool was useful, it also had some pain points I wasn't very fond of, so I decided to remix a lot of great ideas from it and create my own: [osmprj][osmprj]. This was a really fun experience, and I've written extensively about it in that project's [introduction blog post][osmprj-intro].

Right after the talk at the conference, an audience member asked whether I would be able to give the same talk internally for their company. I agreed to do so and this also inspired me to better adapt the material for an actual workshop. I have since given this workshop twice, once for the data-science-for-good organization [CorrelAid][correl-aid]. For CorrelAid especially, I shifted the theme to "researching like a software engineer." This theme resonated especially with me because I have worked both as a social science researcher during my bachelor's and master's programs and also extensively as a software engineer. The workshop content can be found in its entirety on [GitHub][osm-workshop-2026], and everyone is free to use and adapt it to their own needs. There's even a fully functional CLI application similar to the one I use for calculating routes to hospitals called "parkalyzer" that is meant to calculate routes to parks (or anything really) that you can experiment with.

A lot of work went into preparing that workshop too. One of the things I'm most proud of was how I packaged everything with conda so that workshop participants could run everything via [pixi][pixi]. The workshop was a culmination of using all the various tools I had slowly been chipping away at over the past year, summarized below:

- [ors-launcher][ors-launcher]: Simple CLI wrapper over openrouteservice, making it even easier to use
- [osmprj][osmprj]: Project based workflows for importing OSM data into PostgreSQL
- [pg-helper][pg-helper]: Simple CLI wrapper for PostgreSQL in conda environments
- [zensus2pgsql][zensus2pgsql]: CLI for importing census data into PostgreSQL

Most of these packages are currently available on my own conda channel: [gis-forge][gis-forge] and `zensus2pgsql` is available on [conda-forge][conda-forge].

Seeing all of these little tools come together like this to create powerful applications for analysis is really neat. I often ask myself whether I prefer doing the analysis or creating the tools themselves while working on these projects. The answer is both! I write the tools to do the analysis and then write even more once I realize there's a process I could better streamline for next time. A never-ending cycle.

Thanks for reading this far. I hope you enjoyed my behind-the-scenes tour of the journey I went through this year to deliver probably the best PyCon talk I've ever given. Looking forward to giving you all even more interesting content in the future!

---


[youtube-plugin-friendly]: https://youtu.be/d40tBcqopAI
[thesis]: /posts/2022-01-11-master-thesis-project--auto-reduction-planning-kiel/
[youtube-exploring-germanys]: https://youtu.be/1LEXE8H0BaE
[zensus2pgsql]: https://travishathaway.github.io/zensus2pgsql/
[how-many-rewes]: /posts/2025-12-22-how-many-rewes-does-germany-have/
[fossgis]: /posts/2026-03-29-reflections-on-fossgis-2026/
[pgrouting]: https://pgrouting.org/
[ems-pgrouting]: https://github.com/travishathaway/ems-germany-analysis/blob/6ea9b0c2a24d1c0ed97f9213eb511a7f11e71f30/ems_germany_analysis/routines.py#L47
[project-resources]: https://pyconde2026.thath.net/links.html
[openrouting-service]: https://openrouteservice.org/
[krankenhaus-atlas]: https://krankenhausatlas.statistikportal.de/
[pgosm-flex]: https://pgosm-flex.com/
[osmprj]: https://osmprj.dev/
[osmprj-intro]: https://osmprj.dev/blog/2026/05/07/introducing-osmprj
[correl-aid]: https://correlaid.org/
[osm-workshop-2026]: https://github.com/travishathaway/osm-workshop-2026
[pixi]: https://prefix.dev/
[ors-launcher]: https://github.com/travishathaway/ors-launcher/
[gis-forge]: https://anaconda.org/gis-forge
[conda-forge]: https://conda-forge.org/