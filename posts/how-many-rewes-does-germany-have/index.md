---
author: Travis Hathaway
title: "How Many REWEs Does Germany Have?"
date: 2025-12-21
description: Check out the slides from my recent presentation about asyncio at Python Users Berlin and read an exciting Python related announcement.
featured_image: "/img/post_images/how-many-rewes-does-germany-have"
featured_image_thumbnail: "/img/post_images/how-many-rewes-does-germany-have-800"
show_featured_image: true
tags: [gis, urban geography]
layout: layouts/post_with_plotly.njk
feature_image_credits: '
  <div style="font-size: 0.8em; margin-bottom: 2em">
    <i>
    Photo by <a href="https://unsplash.com/de/@franki?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Franki Chamaki</a> on <a href="https://unsplash.com/de/fotos/weiss-rot-beschriftete-packung-auf-weissem-regal-ivfp_yxZuYQ?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
    </i>
  </div>'
---

According to their [official website](https://www.rewe-group.com/de/unternehmen/struktur-und-vertriebslinien/rewe/), they have over 3,800 locations in Germany, but I wouldn't be writing an entire blog post about this if I just wanted to direct you to single link. Today, I'm going to show you another way to answer that question and more with OpenStreetMap data, and I'll add even more to this by including the 2022 German Census in my analysis.

### Background

I've previously written about [processing OpenStreetMap data](/posts/2022-04-02-processing-osm-data-with-postgresql-and-python/) and even included a [fun waste basket analysis](/posts/2022-04-02-processing-osm-data-with-postgresql-and-python/#report), but since then, things have changed and new data has become available, most notably the [2022 German Census](www.destatis.de/DE/Themen/Gesellschaft-Umwelt/Bevoelkerung/Zensus2022/_inhalt.html). For me, the most interesting part of this dataset was their [Zensus Atlas](https://atlas.zensus2022.de/) that gives detailed demographic data at a resolution of 100 meters (previously this was only offered at a 1 kilometer resolution).

<div class="callout callout-info">
  I liked Zensus Atlas dataset so much that I even wrote a CLI tool for importing it into PostgreSQL. It's called <a href="https://travishathaway.github.io/zensus2pgsql/" title="Link to zensus2pgsql project documentation">zensus2pgsql</a>. Please check it out and leave star if you find it useful 🌟.
</div>

So, armed with these datasets, let's figure out how many REWEs Germany has and see what other questions we can answer along the way 🏃‍♂️‍➡️.
