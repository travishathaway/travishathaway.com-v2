---
author: Travis Hathaway
title: "Using Pandoc and Github for Writing"
date: 2021-03-16
description: "Learn how I use Pandoc and Github for creating a productive and safe (i.e. backups) writing environment"
featured_image: "/img/post_images/pen_and_paper"
featured_image_thumbnail: "/img/post_images/pen_and_paper_small"
show_featured_image: true
tags: [writing, software]
layout: layouts/post.njk
feature_image_credits: '
  <div style="font-size: 0.8em; margin-bottom: 0.7em">
    <i>
      Photo by <a href="https://unsplash.com/@aaronburden?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Aaron Burden</a> on <a href="/s/photos/pen-and-paper?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
    </i>
  </div>'
---


When I started my masters program last year, one thing I new for certain I would have to do were writing assignments. These included things like seminar papers, reports and the biggest of all, my masters thesis. Coming straight out of the world of software engineering, I had become very acquainted with text editors and revision control, and I intended to use these tools for my writing as well. There was no going back to software like Microsoft Word or Libre Office…

I began searching for some solutions and initially knew that the text formatting language LaTeX was an option. During my undergraduate program, I had seen some pretty impressive examples from students I knew from the computer science program. But unfortunately, I never found the time to learn LaTeX and wasn’t really prepared to devote the amount of time necessary to learn how to use it well.

Being a former web developer, I was very familiar with HTML/CSS and thought this could be an option. It would be easy enough to just write the essay in this format and then use a html-to-pdf  tool to create the finished product. As I attempted this though, I found it to be very cumbersome and not ideal for writing.

Finally, I ended up using a format called “Markdown” which I had also used quite often as a software engineer for writing project documentation. Markdown has an easy to use syntax which can be converted to a variety of other formats including HTML and PDF. One of the best things about markdown is that you can also include HTML tags when you need that fine level control of your layout. For me this was the perfect solution.

The question still remained as to which markdown-to-pdf converter I was going to use.  After a quick search on the internet, it became clear that this tool was going to be Pandoc. Pandoc is an incredibly versatile tool that allows conversions to-and-from a dizzying array of formats including HTML, Markdown, LaTeX and PDF. Furthermore, the best feature, in my opinion, is the “citeproc” extension.  This is the extension that allows you to include references in the Markdown that your write, and when you convert that Markdown to PDF, the references along with a bibliography are automatically generated and included for you.  The key ingredient to getting this working is having your list of references available in the machine readable “BibTeX” format, which can you easily export from a reference management software like Zotero.

To give you all an example of what that looks like in practice, I’ve included a snipped of both the markdown document, the BibTeX file and finally the Pandoc command that generates the your PDF.

**Markdown (paper.md)**

```
# Title

According to @doe_aliens_2021 the world will soon be invaded by tiny green men! 
In the future we will all live underground [@robinson_bleak_2019].

## References
```

**BibTex (bibliography.bib)**

```
@book{doe_aliens_2021,
  address = {London; New York},
  title = {Aliens: We are all doomed},
  isbn = {978-1-11111-123-4},
  publisher = {Alien Publishing},
  author = {Doe, John},
  year = {2021},
}

@book{robinson_bleak_2019,
  address = {San Francisco},
  title = {Bleak Times Ahead for the Human Race},
  isbn = {978-1-11111-333-5},
  publisher = {Doomsday Publishing},
  author = {Robinson, Jane},
  year = {2019},
}
```


**Pandoc Command**\*

In the following command, we first let Pandoc know we want to process our citations by adding the filter flag. With the remain flags, we just tell it where to find our BibTeX file (bibliography.bib) and our Markdown file (paper.md).

```
$ pandoc \
    --filter pandoc-citeproc \
    --bibliography=bibliography.bib \
    -s paper.md \
    -o paper.pdf
```
\**pandoc is a command line tool, so you will need a little familiarity with how run a terminal, but this can mostly be achieved by copying and pasting from others.*

That generates something that looks like this below (you can also [check out the PDF here](https://travishathaway.com/example_paper.pdf))

<hr />

### Title

According to Doe (2021) the world will soon be invaded by tiny green men! In the future we will all live underground (Robinson 2019).

#### References

Doe, John. 2021. Aliens: We Are All Doomed. London; New York: Alien Publishing.

Robinson, Jane. 2019. Bleak Times Ahead for the Human Race. San Francisco: Doomsday Publishing.

<hr />

After I discovered this approach, I was extremely happy to know I would never have to write another bibliography by hand again!  This is tedious work and is not fun to do.  This approach is also really helpful when managing a large amount references or when you have to make updates later to a reference that you used.

The final step in my process was saving my work somewhere reliable.  Knowing that all I was saving were text files which take up very little space, I felt that a solution like Git would work really well. Git repositories are version control systems that lend themselves very well to managing text files.  I had been using revision control for years to manage various software projects I had worked on and was now excited to try it out on the papers that I would be writing.

In order to save these Git repositories to a remote server and hence make a backup of it somewhere other than your computer, you need to use a service like GitHub.  So, for me the first step was going to GitHub and creating a private repository under my account that would hold all of my work.  You could also make this public but keep in mind anyone will be able to view it!   After that, you simply clone the repository to your computer and commit and push at regular intervals.  I usually try to save my progress on a paper everyday to make sure I always have a back up somewhere safe.  The best thing out of all of this is that GitHub is a free service, so it cost nothing at all.

If you are interesting in learning more about [Pandoc](https://pandoc.org) or [GitHub](https://github.com/) I highly suggest checking out their websites.  For me, they are the perfect tool set to use together to help ease the process of writing and to ensure you are always backing up your work to a safe space.  Also, be sure to check out [Zotero](https://zotero.org) too if you are interested in using a citation manager. 
