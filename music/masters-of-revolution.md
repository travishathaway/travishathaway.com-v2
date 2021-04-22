---
title: "Masters of Revolution"
layout: layouts/post.njk
---

<div class="blog-image-right">
  <a href="home_studio.jpg" title="Home Studio">
    <img src="home_studio.jpg" alt="Home Studio"/>
  </a>
  <span style="font-size: 0.8em; display: inherit">
    <i>Home studio I made in the corner of my uncle's living room in 2016</i>
  </span>
</div>

Like of most of my projects, this was one that got started but then never really finished (but are they ever really *finished*?). Regardless, it will always be on the perennial back-burner of my musical endeavours. 

After writing nothing but metal for most of my life, I wanted to see what would happen when I slowed things down and tried to sing clearly instead of growling screams. I was also inspired by the music I was playing while I was in the band Megaton Leviathan, which was much slower and more repetitive than what I was used too. I am also super into gothic music styles too, so that also had a big influence.

The following songs were meant to be the demo for this project, but it never fully materialized. So, it feels nice to finally publish them somewhere, so that they may be forever remembered (or forgotten).

## The Demo

<table style="table-layout: auto; display: inherit; width: 100%">
  <thead>
    <th>#</th>
    <th>Title</th>
    <th></th>
  </thead>
  <tbody>
    <tr>
      <td>1</td>
      <td>Lost Light</td>
      <td>
        <audio id="track-1" controls>
          <source src="songs/Lost Light-001.mp3" type="audio/mpeg">
          No songs for you!!! (get a better browser that supports the audio tag)
        </audio> 
      </td>
    </tr>
    <tr>
      <td>2</td>
      <td>In an Endless Way</td>
      <td>
        <audio id="track-2" controls>
          <source src="songs/In an Endless Way-001.mp3" type="audio/mpeg">
          No songs for you!!! (get a better browser that supports the audio tag)
        </audio>
      </td>
    </tr>
    <tr>
      <td>3</td>
      <td>Masters of Silence</td>
      <td>
        <audio id="track-3" controls>
          <source src="songs/Masters of Silence.mp3" type="audio/mpeg">
          No songs for you!!! (get a better browser that supports the audio tag)
        </audio>
      </td>
    </tr>
    <tr>
      <td>4</td>
      <td>The Road</td>
      <td>
        <audio id="track-4" controls>
          <source src="songs/The Road (demo).mp3" type="audio/mpeg">
          No songs for you!!! (get a better browser that supports the audio tag)
        </audio>
      </td>
    </tr>
  </tbody>
</table>

## Song-by-song descriptions

### Lost Light

This was the very first song I wrote for this project (way back in the latter half of 2016) and still one of my favorites. The lyrics are admittedly vague and meaningless (I am not the best poet). My hope was that they convey a sense of hopelessness, fear and doubt.


### In an Endless Way 

The second song I wrote for this project, the lyrics of this song were actually written with some sort of a purpose in mind. As I wrote it, many fascist-lite<sup>tm</sup> regimes were gaining power all around the world, and I meant to write it from the perspective of the individuals receiving the unwanted wrath from these racist and sexist organizations.

### Masters of Silence

I came up with the main riff I used for this song about 8 years ago and before I recorded this, had always been looking for somewhere to use it. The alternating tritone and minor chords give a nice sense of dissonance, tension and release, which made a great base for stacking more melodies on top of.

Sadly, this is actually incomplete in it's current incantation. I hope to finish it one day....

### The Road

This was the latest track I recorded for this project. I was pretty excited to use a new acoustic guitar I had recently bought for it (you will hear it in the first half). I am still not sure about the break in the middle to a heavier more distorted section. If I ever revisit this track, I'll most likely keep it entirely acoustic.


<script>
$(document).ready(function( $ ) {
  var audioTracks = [];

  // Collect all the audio tracks
  $('audio').each(function(idx, elm) {
    console.log(elm);
    audioTracks.push(elm.id);
  });

	$('audio').on("play", function (me) {

    // Make sure there's only one track playing at a time
		$('audio').each(function (i,e) {
			if (e !== me.currentTarget) {
				this.pause(); 
			}
		});

    // If this isn't the last row in the table find the next audio element and play it.
    // This should end up functioning a lot like Bandcamp's interface.
    $('audio').on('ended', function(me) {
      var elmId = me.target.id;
      var nextIdx = audioTracks.indexOf(elmId) + 1;

      if (nextIdx < audioTracks.length) {
        nextElmId = audioTracks[nextIdx];
        $(`#${nextElmId}`)[0].play();
      }
    });
	});
});
</script>
