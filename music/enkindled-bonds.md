---
title: "Masters of Revolution"
layout: layouts/base.njk
---

# Enkindled Bonds

<div class="blog-image-right">
  <a href="cover_art.png" title="Cover art">
    <img src="cover_art.png" alt="Cover art"/>
  </a>
  <span style="font-size: 0.8em; display: inherit">
    <i>Cover art made with MS Paint circa 2009</i>
  </span>
</div>

Enkindled Bonds was the name I gave to my first metal project. I wrote and recorded most of this stuff when I was 19. Although the music was okay (in my opinion), the drum machines were terrible. I mostly relied on "Redrum" in Reason using some pretty inappropriate drum kits (funk/disco). But, regardless, still pretty entertaining.

The name Enkindled Bonds was something I came up with while smoking a lot of weed. These "bonds" were supposedly the ones you make with friends after enkindling the sacrament (weed). Beyond that, there really was not much more to that name. The song lyrics were mostly just about things like society collapsing (Crisis Now) or invading terrors (Unholy, Blasphemous, Beast).

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
      <td>Crisis Now</td>
      <td>
        <audio id="track-1" controls>
          <source src="songs/crisis_now.mp3" type="audio/mpeg">
          No songs for you!!! (get a better browser that supports the audio tag)
        </audio> 
      </td>
    </tr>
    <tr>
      <td>2</td>
      <td>Unholy, Blasphemous, Beast</td>
      <td>
        <audio id="track-2" controls>
          <source src="songs/unholy_blasphemous_beast.mp3" type="audio/mpeg">
          No songs for you!!! (get a better browser that supports the audio tag)
        </audio>
      </td>
    </tr>
    <tr>
      <td>3</td>
      <td>War On</td>
      <td>
        <audio id="track-3" controls>
          <source src="songs/war_on.mp3" type="audio/mpeg">
          No songs for you!!! (get a better browser that supports the audio tag)
        </audio>
      </td>
    </tr>
    <tr>
      <td>4</td>
      <td>Golden Brown</td>
      <td>
        <audio id="track-4" controls>
          <source src="songs/golden_brown.mp3" type="audio/mpeg">
          No songs for you!!! (get a better browser that supports the audio tag)
        </audio>
      </td>
    </tr>
  </tbody>
</table>

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

