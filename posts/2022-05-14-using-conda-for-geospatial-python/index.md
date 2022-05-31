---
author: Travis Hathaway
title: "Using conda for Geo-Spatial Python Development"
date: 2022-05-14
description: "While using Python for GIS development, getting your environment setup can be a challenge in and of itself. In this post, I explain how to alleviate this process using conda and introduce several open-source packages for geo-spatial analysis."
featured_image: "/img/post_images/conda_geo"
featured_image_thumbnail: "/img/post_images/conda_geo_small"
show_featured_image: true
tags: [python, conda]
layout: layouts/post.njk
feature_image_credits: '
  <div style="font-size: 0.8em; margin-bottom: 2em">
    <i>
    Photo by <a href="https://unsplash.com/@greg_rosenke">Greg Rosenke</a> on <a href="https://unsplash.com/photos/GOWz0zTf_vY?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
    </i>
  </div>'
---

## Introduction

As I have alluded to in previous posts ([Processing OpenStreetMap Data with PostgreSQL in Python](/posts/2022-04-02-processing-osm-data-with-postgresql-and-python)), the Python programming language can be a very powerful tool for geo-spatial analysis. This is primarily because of the many great open-source packages out there at our disposal. Unfortunately, installing these packages can sometimes be a difficult process, especially if you want this to be easily repeated across a variety of operating systems (e.g. Windows, OSX, Linux, etc.). In this post, I explain how [conda][conda] and conda environments can make managing these packages and sharing them across workspaces easier. Additionally, I provide an overview of some good open-source, geo-spatial packages to help kick-start and enable your analysis.

### Why conda?

[conda][conda] is an operating system agnostic package manager which allows you to install many different types of programming language libraries and software on your computer (referred to as "packages"). Many of these packages are Python libraries, but unlike a Python specific package manager like [pip](https://pip.pypa.io/en/stable/), conda allows you to install non-Python dependencies as well. For applications in GIS, this can be especially useful because many geo-spatial Python packages rely on underlying libraries such as [gdal][gdal] which is a C/C++ dependency that can be tricky to install on certain operating systems (e.g. OSX or Windows).

If you do not have [conda][conda] currently installed on your computer, go [here to download and run the installer][conda-install].

### Preparing your analysis project

Once you have conda installed, the best way to stay organized with your projects is using environments and environment config files. Environments are what allow you to separate your dependencies from each other and are very similar to the built-in virtual environments used often with Python. But, with `conda` virtual environments, you also gain the ability to install different Python versions regardless of which Python version you have available on you computer currently.

For example, the following command will give you an environment with the latest Python 3.10:

```bash
$ conda create -n geo-analysis python=3.10
```

As your project dependency list grows, it's also a good idea to begin organizing these in an environment configuration file. Environment configuration files for conda use the YAML format, and an example of this is shown below:

```yaml
# environment.yml
name: geo-analysis
channels:
  - conda-forge
  - defaults
dependencies:
  - python=3.10
  - gdal=3.4.2
  - rasterio
```

To help clarify this configuration file, here is a brief explanation of each section:

#### Name

This is the name of your environment. You will need this later when activating it, so pick something that is easy to remember and type. 

#### Channels

Channels are where conda looks to install packages. By default, all conda installs include `defaults`. We also add the community managed `conda-forge` channel because it has a wider selection of packages (i.e. if something cannot be found on `defaults` it's usually possible to find it on `conda-forge`).

#### Dependencies

This is where you define all the packages to include in your environment. Here, we have listed the Python version we want as well as the packages `gdal` at version `3.4.2` and the `rasterio` package. When the version is omitted, like we did for `rasterio`, conda attempts to find the most recent version that is still compatible with all the other dependencies defined.

To actually create this environment from the configuration file, you run the following command:

```bash
conda env create -f environment.yml
```

Once this completes, you will have an environment named `geo-analysis` that you can activate with:

```bash
conda activate geo-analysis
```

Good job, you are *almost* ready to begin your analysis...

<hr />

### Which packages should I actually use?

You may now be asking yourself, "okay, I have my development environment setup, but which packages should I actually use for my geo-spatial analysis project?" Below, I provide a quick overview of some common packages available for performing this type of analysis using Python.

#### Rasterio

**Link:** [https://rasterio.readthedocs.io/](https://rasterio.readthedocs.io/)

The goal of the Rasterio project is to provide a Pythonic API for working with raster datasets. Under the hood, this project also relies on the well known NumPY library, so those already familiar with those data structures will find this library easier to learn and use. Even if you are not, this project provides extensive documentation and examples to learn from.

#### Shapely

**Link:** [https://shapely.readthedocs.io/](https://shapely.readthedocs.io/)

Shapely provides a Pythonic API for working vector datasets. Many features of Shapely can also be found in software such as QGIS and PostGIS. This library provides those wishing to do spatial analysis the added flexibility of not having to use such software if  they do not need too. For example, many manual processes performed in QGIS can be automated with Shapely.

#### pyproj

**Link:** [https://pyproj4.github.io/pyproj/stable/](https://pyproj4.github.io/pyproj/stable/)

pyproj allows you to convert geo-spatial data between various projections. This library can also be used in conjunction with Shapely.

#### GeoPandas

**Link:** [https://geopandas.org/](https://geopandas.org/)

GeoPandas can be thought of as an extension of the popular Pandas library. It adds support for working with geographic data types in a data structure called a dataframe that any user of Pandas would be familiar with. On top of other features, it allows you to perform spatial joins and create print or interactive maps.

<hr />

## Final thoughts

Each of the projects mentioned above have very detailed and well thought out documentation. They will be your best next starting points for learning even more.

Also, stay tuned for future articles where I plan on stepping you through my own analysis projects with some of those wonderful libraries mentioned above.

[conda]: https://conda.io
[conda-install]: https://docs.conda.io/en/latest/miniconda.html 
[gdal]: https://osgeo.org
[postgis]: https://postgis.net
[qgis]: https://qgis.org
