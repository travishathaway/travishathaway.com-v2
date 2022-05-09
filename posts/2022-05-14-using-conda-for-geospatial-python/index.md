---
author: Travis Hathaway
title: "Using conda for Geospatial Python Development"
date: 2022-05-14
description: "For beginners using Python for GIS development, sometimes just getting your environment setup can be quite the challenge. In this post, I explain how using conda allows me to quickly initialize my environment and get to the important work of actual analysis."
featured_image: "/img/post_images/conda_geo"
featured_image_thumbnail: "/img/post_images/conda_geo_small"
show_featured_image: true
tags: [python, GIS, conda]
layout: layouts/post.njk
feature_image_credits: ''
---

When performing geo-spatial analysis in Python, there are several extra
packages, once installed, which can make your life much easier by assisting
in the analysis process. Unfortunately,
installing these extra libraries and making sure others who wish to replicate
or modify your work regardless of their operating system can be a tough 
expectation to manage. In this post, I share how to do this with 
[conda][conda] using environment files and give you an overview of some
of the extra geo-spatial packages in Python you can for creating
interesting anaylsis work.

[conda][conda] is an operating system agnostic package manager which allows you
to install many different types of a software on your computer. Many of these
packages are extra Python libraries, but unlike Python
specific package managers like `pip` or `poetry`, `conda` allows you to install
non-python dependencies as well. For applications in GIS, this can be especially
usefull because certain Python packages like [gdal][gdal] have C/C++
dependencies that can be tricky to install on certain operating systems (e.g OSX
or Windows).

If you do not have [conda][conda] installed on your computer, go [here to install
miniconda][conda-install], which is a smaller version of the `conda` installer.

Once you have this installed, the best way to stay organized with projects is by
using environments and environment config files. Environments are what allow you
to separate your dependencies from each other and are very similar to the
built-in
virtual environments you get with Python. But, with `conda` virtual environments, you
also gain the ability to install different Python versions. Regardless of
which Python version you have available on you computer, the following will give
you an environment with Python 3.10:

```bash
$ conda create -n my-test-env python=3.10
```



environment using Python 3.9 with the latest version of `gdal`. 


[conda]: https://conda.io
[conda-install]: https://docs.conda.io/en/latest/miniconda.html 
[gdal]: https://osgeo.org
