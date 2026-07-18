import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Anchor, Mountain, Bike, Fish, Compass, MapPin, Calendar as CalendarIcon,
  Sun, Tent, Check, X, Menu, Phone, Mail, Clock, ArrowRight, Route,
  ExternalLink, TrendingUp
} from "lucide-react";

/* ---------------------------------------------------------------- */
/* DATA                                                              */
/* ---------------------------------------------------------------- */


/* Real, freely-licensed landscape photos (Wikimedia Commons) used for the header
   gallery and as representative images on activity cards, keyed by location.
   These use Wikimedia's /thumb/.../1280px- rendition rather than the full-size
   originals: the originals are multi-megabyte files that Wikimedia's CDN
   throttles (HTTP 429) after only a handful of requests, which is what was
   showing up as the broken-image gradient across the site. The 1280px
   thumbnails are pre-generated, small, and don't get rate-limited. CSS handles
   the actual display sizing/cropping. */
const LOCATION_IMAGES = {
  "Lake Almanor": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Early_morning_at_Lake_Almanor.jpg/1280px-Early_morning_at_Lake_Almanor.jpg",
  "Chester": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/ChesterCA1.jpg/1280px-ChesterCA1.jpg",
  "Westwood": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Fall_Colors_along_Hwy_89_Plumas_County_%286263493591%29.jpg/1280px-Fall_Colors_along_Hwy_89_Plumas_County_%286263493591%29.jpg",
  "Silver Lake": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Cliff_Lake_%2815262176219%29.jpg/1280px-Cliff_Lake_%2815262176219%29.jpg",
  "Mountain Meadows Reservoir": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Aerial_-_Mountain_Meadows_Reservoir_01.jpg/1280px-Aerial_-_Mountain_Meadows_Reservoir_01.jpg",
  "Lassen Volcanic NP": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/A475%2C_Lassen_Volcanic_National_Park%2C_California%2C_USA%2C_Lassen_Peak_and_Lake_Helen%2C_2016.jpg/1280px-A475%2C_Lassen_Volcanic_National_Park%2C_California%2C_USA%2C_Lassen_Peak_and_Lake_Helen%2C_2016.jpg",
  "Caribou Wilderness": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Caribourockgarden.jpg/1280px-Caribourockgarden.jpg",
};

/* A few specific, well-known spots get their own photo instead of the generic
   location shot — keyed by activity id. */
const ACTIVITY_IMAGE_OVERRIDES = {
  12: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Bumpass_Hell%2C_Lassen_Volcanic_National_Park%2C_California_%2823320555385%29.jpg/1280px-Bumpass_Hell%2C_Lassen_Volcanic_National_Park%2C_California_%2823320555385%29.jpg",
  22: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Kings_Creek_Falls_Trail_%282024%29-L1006076.jpg/1280px-Kings_Creek_Falls_Trail_%282024%29-L1006076.jpg",
  16: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Below_Vista_Point_on_the_East_Shore_of_Lake_Almanor.jpg/1280px-Below_Vista_Point_on_the_East_Shore_of_Lake_Almanor.jpg",
  23: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Cinder_Cone_at_Lassen_Volcanic_National_Park.jpg/1280px-Cinder_Cone_at_Lassen_Volcanic_National_Park.jpg",
  24: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Terrace_Lake%2C_Lassen_Volcanic_National_Park.jpg/1280px-Terrace_Lake%2C_Lassen_Volcanic_National_Park.jpg",
  25: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Boiling_Springs_Lake_Lassen_NP.jpg/1280px-Boiling_Springs_Lake_Lassen_NP.jpg",
  27: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Subway_Cave_entrance.jpg/1280px-Subway_Cave_entrance.jpg",
  28: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Terminal_Geyser_Lassen_NP.jpg/1280px-Terminal_Geyser_Lassen_NP.jpg",
  29: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Susan_River_Canyon_%2851581237527%29.jpg/1280px-Susan_River_Canyon_%2851581237527%29.jpg",
  37: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Chaos_Crags_and_Lassen_Peak_at_Manzanita_Lake.jpg/1280px-Chaos_Crags_and_Lassen_Peak_at_Manzanita_Lake.jpg",
  38: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Juniper_Lake%2C_Lassen_National_Park.jpg/1280px-Juniper_Lake%2C_Lassen_National_Park.jpg",
};

function imageForActivity(a) {
  return ACTIVITY_IMAGE_OVERRIDES[a.id] || LOCATION_IMAGES[a.location];
}

/* The header photo strip: opens on Lake Almanor, scrolls into Lassen Volcanic NP
   and the other areas featured across the site. */
const HERO_GALLERY = [
  { location: "Lake Almanor", caption: "Lake Almanor", sub: "13 miles of shoreline, Lassen Peak on the skyline" },
  { location: "Lassen Volcanic NP", caption: "Lassen Volcanic National Park", sub: "Hydrothermal trails and a 10,457 ft summit hike" },
  { location: "Chester", caption: "Chester", sub: "Coffee, the market, and the lakeshore trailhead" },
  { location: "Westwood", caption: "Westwood", sub: "Gateway to the Bizz Johnson Trail" },
  { location: "Silver Lake", caption: "Silver Lake", sub: "A quieter, granite-backed alternative to the main basin" },
  { location: "Mountain Meadows Reservoir", caption: "Mountain Meadows Reservoir", sub: "Mellow water and strong bird life" },
  { location: "Caribou Wilderness", caption: "Caribou Wilderness", sub: "Volcanic plateau dotted with backcountry lakes" },
];

const LOCATIONS = ["Lake Almanor", "Chester", "Westwood", "Silver Lake", "Mountain Meadows Reservoir", "Lassen Volcanic NP", "Caribou Wilderness"];
const INTERESTS = [
  { id: "boating", label: "Boating", icon: Anchor },
  { id: "fishing", label: "Fishing", icon: Fish },
  { id: "hiking", label: "Hiking", icon: Mountain },
  { id: "biking", label: "Biking", icon: Bike },
  { id: "offroading", label: "Off-Roading", icon: Route },
  { id: "sightseeing", label: "Sightseeing", icon: Sun },
];

const ACTIVITIES = [
  { id: 1, location: "Lake Almanor", tags: ["boating", "sightseeing"], title: "Sunrise pontoon cruise", desc: "Glass-calm water and a straight-on view of Lassen Peak from the middle of the lake.", gear: "pontoon", hours: 2, sourceUrl: "https://www.lakealmanorarea.com/" },
  { id: 2, location: "Lake Almanor", tags: ["fishing"], title: "Troll for rainbows off Big Springs", desc: "One of the basin's better-known holds for stocked rainbow and brown trout.", gear: "pontoon", hours: 3, sourceUrl: "http://californiasgreatestlakes.com/almanor/almanor_fishing.html" },
  { id: 3, location: "Lake Almanor", tags: ["boating", "sightseeing"], title: "Cove-hopping & swim stop", desc: "Anchor up at Rocky Point or Almanor West for a lunch break in the water.", gear: "pontoon", hours: 2.5, sourceUrl: "https://www.lakealmanorarea.com/" },
  { id: 4, location: "Chester", tags: ["sightseeing"], title: "Walk Main Street, Chester", desc: "Coffee, the Saturday market in summer, and the trailhead for the lakeshore path.", gear: null, hours: 1, sourceUrl: "https://www.lakealmanorarea.com/" },
  { id: 5, location: "Chester", tags: ["hiking"], title: "Lake Almanor Recreation Trail", desc: "An easy, mostly flat shoreline walk or ride out of town — good warm-up day.", gear: "bike", hours: 1.5, sourceUrl: "https://www.alltrails.com/trail/us/california/lake-almanor-recreation-trail" },
  { id: 6, location: "Westwood", tags: ["biking"], title: "Bizz Johnson Trail", desc: "A converted rail line through Susan River Canyon — long, scenic, and mostly downhill one way.", gear: "bike", hours: 3, sourceUrl: "https://www.blm.gov/visit/bizz-johnson" },
  { id: 7, location: "Westwood", tags: ["sightseeing"], title: "Paul Bunyan mural & town loop", desc: "A short stretch-the-legs stop with local logging history.", gear: null, hours: 1, sourceUrl: "https://westwoodareachamber.net/" },
  { id: 8, location: "Silver Lake", tags: ["hiking", "sightseeing"], title: "Silver Lake basin hike", desc: "Granite backdrop and a much quieter shoreline than Almanor — pack in what you need.", gear: null, hours: 3, sourceUrl: "https://www.fs.usda.gov/r05/lassen/recreation/caribou-wilderness" },
  { id: 9, location: "Silver Lake", tags: ["fishing"], title: "Shoreline cast for brook trout", desc: "A high-country lake with a different rhythm than the main basin.", gear: null, hours: 2, sourceUrl: "https://www.fs.usda.gov/r05/lassen/recreation/caribou-wilderness" },
  { id: 10, location: "Mountain Meadows Reservoir", tags: ["fishing", "sightseeing"], title: "Quiet-water fishing", desc: "Lightly pressured water with strong bird life — bring binoculars.", gear: null, hours: 2.5, sourceUrl: "https://en.wikipedia.org/wiki/Mountain_Meadows_Reservoir" },
  { id: 11, location: "Mountain Meadows Reservoir", tags: ["boating"], title: "Slow-troll the reservoir", desc: "A mellower alternative to Almanor when you want fewer wakes.", gear: "pontoon", hours: 2, sourceUrl: "https://en.wikipedia.org/wiki/Mountain_Meadows_Reservoir" },
  { id: 12, location: "Lassen Volcanic NP", tags: ["hiking", "sightseeing"], title: "Bumpass Hell boardwalk", desc: "The park's signature hydrothermal area — boiling springs, mud pots, steam vents.", gear: null, hours: 2.5, sourceUrl: "https://www.nps.gov/thingstodo/hikebumpasshell.htm" },
  { id: 13, location: "Lassen Volcanic NP", tags: ["hiking"], title: "Lassen Peak summit trail", desc: "A full-day, full-effort hike to 10,457 ft with basin views on a clear day.", gear: null, hours: 6, sourceUrl: "https://www.nps.gov/thingstodo/hikelassenpeak.htm" },
  { id: 14, location: "Lassen Volcanic NP", tags: ["sightseeing"], title: "Highway 89 scenic drive", desc: "The park road itself — pullouts at Sulphur Works, Emerald Lake, and Lake Helen.", gear: null, hours: 2, sourceUrl: "https://www.nps.gov/lavo/planyourvisit/gettingaround.htm" },
  { id: 15, location: "Chester", tags: ["biking"], title: "Chester climb & coast", desc: "A rolling road ride into the hills above town with a fast return.", gear: "bike", hours: 2, sourceUrl: "https://www.lakealmanorarea.com/" },
  { id: 16, location: "Lake Almanor", tags: ["sightseeing"], title: "Golden-hour photo run", desc: "The Maverick gets you to the east-shore overlooks locals actually use.", gear: "maverick", hours: 1.5, sourceUrl: "https://commons.wikimedia.org/wiki/File:Below_Vista_Point_on_the_East_Shore_of_Lake_Almanor.jpg" },
  { id: 17, location: "Westwood", tags: ["hiking", "offroading"], title: "Backcountry spur trail", desc: "Reach the trailhead fast by ATV, then hike in past the day-tripper crowd.", gear: "atv", hours: 3, sourceUrl: "https://www.fs.usda.gov/activity/lassen/recreation/ohv/?recid=11252&actid=93" },
  { id: 18, location: "Westwood", tags: ["offroading"], title: "Forest Service road loop", desc: "Miles of graded and rough dirt forest roads north of town — a good shakedown run for the Maverick.", gear: "maverick", hours: 2.5, sourceUrl: "https://www.fs.usda.gov/activity/lassen/recreation/ohv/?recid=11252&actid=93" },
  { id: 19, location: "Chester", tags: ["offroading", "sightseeing"], title: "Ridge-top overlook run", desc: "Climb out of the basin on forest roads to viewpoints over the lake and Lassen Peak.", gear: "maverick", hours: 2, sourceUrl: "https://www.lakealmanorarea.com/" },
  { id: 20, location: "Silver Lake", tags: ["offroading"], title: "Dixie Mountain OHV trails", desc: "Rougher, rockier terrain than the valley roads — best suited to the 4-wheeler.", gear: "atv", hours: 3, sourceUrl: "https://www.fs.usda.gov/activity/lassen/recreation/ohv/?recid=11252&actid=93" },
  { id: 21, location: "Mountain Meadows Reservoir", tags: ["offroading", "sightseeing"], title: "Reservoir rim dirt road", desc: "A quiet dirt road circling the meadow and reservoir, good for wildlife sightings along the way.", gear: "maverick", hours: 2, sourceUrl: "https://en.wikipedia.org/wiki/Mountain_Meadows_Reservoir" },
  { id: 22, location: "Lassen Volcanic NP", tags: ["hiking"], title: "Kings Creek Falls", desc: "A signature Lassen waterfall hike down through Kings Creek Meadow to a 30-ft cascade.", gear: null, hours: 2, distance: "2.3 mi loop", difficulty: "Moderate", trail: true, alltrailsUrl: "https://www.alltrails.com/trail/us/california/kings-creek-falls-trail" },
  { id: 23, location: "Lassen Volcanic NP", tags: ["hiking", "sightseeing"], title: "Cinder Cone Trail (Butte Lake)", desc: "A steep climb up a volcanic cinder cone with views over the Fantastic Lava Beds and Painted Dunes.", gear: null, hours: 3.5, distance: "~4 mi round trip", difficulty: "Strenuous", trail: true, alltrailsUrl: "https://www.alltrails.com/trail/us/california/cinder-cone-trail--2" },
  { id: 24, location: "Lassen Volcanic NP", tags: ["hiking"], title: "Terrace, Shadow & Cliff Lakes Loop", desc: "A chain of three backcountry lakes strung together on one loop, quieter than the park's main corridor.", gear: null, hours: 4, distance: "~5.5 mi loop", difficulty: "Moderate", trail: true, alltrailsUrl: "https://www.alltrails.com/trail/us/california/cliff-lake-and-shadow-lake-via-summit-lake-trailhead" },
  { id: 25, location: "Lassen Volcanic NP", tags: ["hiking", "sightseeing"], title: "Boiling Springs Lake & Devils Kitchen", desc: "Warner Valley's hydrothermal features — a milky-colored boiling lake and steaming fumaroles.", gear: null, hours: 3, distance: "~4.2 mi round trip", difficulty: "Moderate", trail: true, alltrailsUrl: "https://www.alltrails.com/trail/us/california/devil-s-kitchen-trail" },
  { id: 26, location: "Chester", tags: ["hiking"], title: "Spencer Meadow National Recreation Trail", desc: "A quieter forested approach toward Lassen's south side, popular with locals over tourist crowds.", gear: null, hours: 4, distance: "~7.5 mi round trip", difficulty: "Moderate", trail: true, alltrailsUrl: "https://www.alltrails.com/trail/us/california/spencer-meadows-trail" },
  { id: 27, location: "Lassen Volcanic NP", tags: ["sightseeing"], title: "Subway Cave Lava Tube", desc: "A short, easy walk through a lava tube near Old Station — bring a flashlight.", gear: null, hours: 1, distance: "0.3 mi loop", difficulty: "Easy", trail: true, alltrailsUrl: "https://www.alltrails.com/trail/us/california/subway-cave-trail" },
  { id: 28, location: "Lassen Volcanic NP", tags: ["hiking"], title: "Domingo Springs to Terminal Geyser", desc: "Follows the PCT corridor from Warner Valley to a steaming geyser basin.", gear: null, hours: 3.5, distance: "~5 mi round trip", difficulty: "Moderate", trail: true, alltrailsUrl: "https://www.alltrails.com/trail/us/california/domingo-springs-trail" },
  { id: 29, location: "Westwood", tags: ["biking"], title: "Bizz Johnson Trail — Susanville to Hobo Camp", desc: "A gentler, flatter stretch of the rail-trail than the canyon section — good for families.", gear: "bike", hours: 2.5, distance: "~8 mi one-way", difficulty: "Easy", trail: true, alltrailsUrl: "https://www.alltrails.com/trail/us/california/bizz-johnson-trail" },
  { id: 30, location: "Caribou Wilderness", tags: ["hiking", "fishing"], title: "Caribou Lake Trail", desc: "The main eastern access into the wilderness from the Silver Lake trailhead, reaching Caribou Lake — the largest lake in the wilderness and a solid bet for trout.", gear: null, hours: 4, distance: "~6 mi round trip", difficulty: "Moderate", trail: true, alltrailsUrl: "https://www.alltrails.com/trail/us/california/caribou-lake-to-triangle-lake-loop" },
  { id: 31, location: "Caribou Wilderness", tags: ["hiking"], title: "Triangle, Twin & Turnaround Lakes Loop", desc: "A gently graded loop past a chain of small lakes from the Cone Lake trailhead — one of the easier introductions to the wilderness.", gear: null, hours: 5, distance: "7.8 mi round trip", difficulty: "Easy", trail: true, alltrailsUrl: "https://www.alltrails.com/trail/us/california/triangle-turnaround-and-black-lakes-trail" },
  { id: 32, location: "Caribou Wilderness", tags: ["hiking"], title: "Gem Lake Trail", desc: "A short walk to one of the wilderness's clearer lakes, backed by granite cliffs — an easy half-day option.", gear: null, hours: 1.5, distance: "2.2 mi round trip", difficulty: "Easy", trail: true, alltrailsUrl: "https://www.alltrails.com/trail/us/california/gem-lake" },
  { id: 33, location: "Caribou Wilderness", tags: ["hiking", "fishing"], title: "Caribou Lake to Turnaround Lake Loop", desc: "A longer loop stringing together several backcountry lakes — best planned as a full day out.", gear: null, hours: 6, distance: "9 mi loop", difficulty: "Moderate", trail: true, alltrailsUrl: "https://www.alltrails.com/trail/us/california/caribou-lake-to-triangle-lake-loop" },
  { id: 34, location: "Caribou Wilderness", tags: ["hiking"], title: "Caribou Wilderness Area Trails (Full Loop)", desc: "The complete wilderness loop past nearly two dozen named lakes — a demanding full day, or an easy overnight with a permit.", gear: null, hours: 8, distance: "14.7 mi loop", difficulty: "Strenuous", trail: true, alltrailsUrl: "https://www.alltrails.com/trail/us/california/caribou-wilderness-area-trails" },
  { id: 35, location: "Lake Almanor", tags: ["hiking", "biking", "sightseeing"], title: "Lake Almanor Recreation Trail (Full Loop)", desc: "The complete paved and dirt path circling all 22 miles of Lake Almanor's shoreline — a serious day for cyclists, a multi-day trek on foot.", gear: null, hours: 8, distance: "22.2 mi loop", difficulty: "Moderate", trail: true, alltrailsUrl: "https://www.alltrails.com/trail/us/california/lake-almanor-recreation-trail" },
  { id: 36, location: "Mountain Meadows Reservoir", tags: ["hiking", "biking", "sightseeing"], title: "Mountain Meadow Reservoir Loop", desc: "A full loop around the reservoir through meadow and forest — one of the basin's best spots for birding along the way.", gear: null, hours: 8, distance: "23.6 mi loop", difficulty: "Moderate", trail: true, alltrailsUrl: "https://www.alltrails.com/trail/us/california/mountain-meadow-reservoir" },
  { id: 37, location: "Lassen Volcanic NP", tags: ["hiking", "sightseeing"], title: "Manzanita Lake Loop", desc: "An easy, hugely popular loop around a postcard-still lake with Lassen Peak reflected on the water — the park's most family-friendly walk.", gear: null, hours: 1, distance: "1.9 mi loop", difficulty: "Easy", trail: true, alltrailsUrl: "https://www.alltrails.com/trail/us/california/manzanita-lake-loop" },
  { id: 38, location: "Lassen Volcanic NP", tags: ["hiking", "sightseeing"], title: "Juniper Lake Loop", desc: "A quieter corner of the park, starting at Juniper Lake Campground on the less-visited southeast side.", gear: null, hours: 2.5, distance: "6.3 mi loop", difficulty: "Moderate", trail: true, alltrailsUrl: "https://www.alltrails.com/trail/us/california/juniper-lake-loop--2" },
  { id: 39, location: "Chester", tags: ["hiking"], title: "Collins Pine Nature Trail", desc: "A short, easy loop through second-growth pine forest just outside Chester — a good birding walk or warm-up.", gear: null, hours: 1, distance: "1.8 mi loop", difficulty: "Easy", trail: true, alltrailsUrl: "https://www.alltrails.com/trail/us/california/collins-pine-nature-trail" },
  { id: 40, location: "Chester", tags: ["hiking"], title: "Hwy 36 Trailhead to Butt Mountain Trail", desc: "A long, demanding climb to one of the highest points overlooking the basin — for experienced hikers with a full day to spend.", gear: null, hours: 9, distance: "19.5 mi round trip", difficulty: "Strenuous", trail: true, alltrailsUrl: "https://www.alltrails.com/trail/us/california/hwy-36-trailhead-to-butt-mountain-trail" },
  { id: 41, location: "Mountain Meadows Reservoir", tags: ["boating"], title: "Launch at Indian Ole Dam", desc: "The reservoir's public boat launch, at the dam off Indian Ole Road — put in here for a slow cruise or a troll for trout and bass.", gear: "pontoon", hours: 2.5, sourceUrl: "https://en.wikipedia.org/wiki/Mountain_Meadows_Reservoir" },
  { id: 42, location: "Mountain Meadows Reservoir", tags: ["fishing"], title: "Fish Indian Ole Dam — shore or by boat", desc: "Cast from the bank right at the dam, or launch here and troll for rainbow trout, brown trout, and smallmouth bass across the reservoir.", gear: null, hours: 2.5, sourceUrl: "https://en.wikipedia.org/wiki/Mountain_Meadows_Reservoir" },
];

/* AllTrails has no working "search results" URL to deep-link to (a plain
   /search?q= request just redirects to their homepage) — its search is a
   client-side autocomplete widget with no shareable URL. So for trails without
   a verified alltrailsUrl (i.e. ones added through the "Add a trail" form),
   fall back to a Google search scoped to alltrails.com, which reliably lands
   on real results instead of silently bouncing to the AllTrails homepage. */
function allTrailsSearchUrl(name) {
  return `https://www.google.com/search?q=${encodeURIComponent(`site:alltrails.com ${name} CA`)}`;
}
function trailLinkFor(t) {
  return t.alltrailsUrl || allTrailsSearchUrl(t.title);
}

const VENDORS = [
  {
    id: "almanor-fishing-adventures",
    name: "Almanor Fishing Adventures",
    category: "Fishing Charter",
    location: "Lake Almanor",
    desc: "Guided trout fishing aboard a 23' boat with a private head — light-tackle trips for all skill levels.",
    phone: "(530) 570-9925",
    url: "https://www.almanorfishingadventures.com/",
  },
  {
    id: "big-daddys-guide-service",
    name: "Big Daddy's Guide Service",
    category: "Fishing Charter",
    location: "Lake Almanor",
    desc: "Trophy trout and kokanee trips on Almanor, with seasonal outings on Bucks Lake and Eagle Lake.",
    phone: "(530) 370-1001",
    url: "https://www.bigdaddyfishing.com/",
  },
  {
    id: "mikes-guide-service",
    name: "Mike's Lake Almanor Guide Service",
    category: "Fishing Charter",
    location: "Lake Almanor",
    desc: "Full-service guided trips with pickup at private docks around the lake.",
    phone: "(530) 383-7785",
    url: "http://www.mikeslakealmanorguideservice.com/",
  },
];

function businessSearchUrl(name) {
  return `https://www.google.com/search?q=${encodeURIComponent(name + " Lake Almanor CA")}`;
}

// Fishing guides shown as bookable "activities" inside the Trip Builder so they surface under the Fishing filter.
const VENDOR_ACTIVITIES = VENDORS.map((v) => ({
  id: `vendor-${v.id}`,
  location: v.location,
  tags: ["fishing"],
  title: v.name,
  desc: v.desc,
  gear: null,
  hours: 5,
  vendorId: v.id,
}));

const LODGING = [
  { id: "paul-bunyan-resort", name: "Paul Bunyan Resort", category: "Resort", location: "Lake Almanor", desc: "Family-owned lodging, RV sites, and camping with an on-site restaurant, near Chester and Westwood.", url: "https://www.paulbunyanresort.com/" },
  { id: "leisure-rv-park", name: "Leisure RV Park", category: "RV Park", location: "Chester", desc: "Shaded RV camping just off Main St in Chester, with on-site showers and laundry.", url: "https://www.leisurervchester.com/" },
  { id: "lake-almanor-lodge", name: "Lake Almanor Lodge", category: "Hotel", location: "Chester", desc: "Full-kitchen rooms with contactless entry, in the heart of Chester.", url: "https://pinecliffresort.net/campgrounds-rv-parks/lake-almanor-lodge" },
  { id: "north-shore-campground", name: "North Shore Campground", category: "Campground", location: "Chester", desc: "Lakefront RV and tent sites with full hookups, a marina, and boat rentals, just east of Chester.", url: businessSearchUrl("North Shore Campground") },
  { id: "lake-cove-resort", name: "Lake Cove Resort", category: "Resort", location: "Lake Almanor", desc: "RV sites and a lakefront A-frame cabin on Highway 147, with marina and launch ramp access.", url: businessSearchUrl("Lake Cove Resort") },
  { id: "best-western-rose-quartz", name: "Best Western Rose Quartz Inn", category: "Hotel", location: "Chester", desc: "A Chester hotel near the lake, close to boating, water skiing, and fishing access.", url: businessSearchUrl("Best Western Rose Quartz Inn Chester") },
];

const DURATIONS = [
  { id: "day", label: "Day Trip", days: 1 },
  { id: "weekend", label: "Weekend", days: 2 },
  { id: "week", label: "Week-Long", days: 6 },
];

const LENGTH_FILTERS = [
  { id: "all", label: "Any length", test: () => true },
  { id: "quick", label: "Quick (< 2 hrs)", test: (h) => h < 2 },
  { id: "half", label: "Half day (2–4 hrs)", test: (h) => h >= 2 && h <= 4 },
  { id: "full", label: "Full day (4+ hrs)", test: (h) => h > 4 },
];

/* Verified against OpenStreetMap/Nominatim geocoding. Westwood and Silver
   Lake were previously off by ~14 mi and ~10 mi respectively — Westwood's
   old pin sat almost on top of Chester, which is what made Westwood
   activities look like they were in Chester. */
const LOCATION_COORDS = {
  "Lake Almanor": { lat: 40.2435, lng: -121.1095 },
  "Chester": { lat: 40.2955, lng: -121.2347 },
  "Westwood": { lat: 40.3041, lng: -121.0038 },
  "Silver Lake": { lat: 40.4945, lng: -121.1649 },
  "Mountain Meadows Reservoir": { lat: 40.2662, lng: -120.9505 },
  "Lassen Volcanic NP": { lat: 40.4367, lng: -121.5057 },
  "Caribou Wilderness": { lat: 40.4887, lng: -121.2088 },
};

/* Many activities that share a "location" actually happen at a distinct spot
   within it — Lassen Volcanic NP alone spans ~106,000 acres, and even a single
   town has multiple named landmarks — so the shared LOCATION_COORDS point can
   be miles from where a given activity actually starts. These per-activity
   coordinates override the generic location point so "View on map" / "Get
   directions" send people to the right place. Trail entries are sourced from
   the same AllTrails page linked in that activity's alltrailsUrl (each
   AllTrails trail page publishes its own exact GeoCoordinates); the rest are
   verified via OpenStreetMap/Nominatim geocoding of the named place mentioned
   in that activity's own description (Big Springs, Almanor West, the Paul
   Bunyan statue, etc). Activities without one real, identifiable spot — open
   lake boating, loosely-defined forest-road loops — are left on the location
   pin, since inventing a fake precise point would be less honest than that.
   The Lake Almanor pontoon activities (1, 2, 3) point to the Almanor Boat
   Launch (adjacent to Almanor North Campground, west shore) rather than their
   on-water destination — since these are trip-planning "get directions" links,
   where to actually launch the boat is more useful than a mid-lake coordinate. */
const ACTIVITY_COORDS = {
  1: { lat: 40.2203, lng: -121.1755 }, // Almanor Boat Launch, Almanor North Campground
  2: { lat: 40.2203, lng: -121.1755 }, // Almanor Boat Launch, Almanor North Campground
  3: { lat: 40.2203, lng: -121.1755 }, // Almanor Boat Launch, Almanor North Campground
  6: { lat: 40.3058, lng: -121.0006 }, // Bizz Johnson Trail's Westwood trailhead — same spot as the Paul Bunyan statue/kiosk
  7: { lat: 40.3058, lng: -121.0006 }, // Paul Bunyan & Babe statue, downtown Westwood
  12: { lat: 40.4587, lng: -121.5053 }, // Bumpass Hell trailhead
  13: { lat: 40.4749, lng: -121.5057 }, // Lassen Peak trailhead
  16: { lat: 40.1780, lng: -121.0824 }, // Vista Point, east shore of Lake Almanor
  17: { lat: 40.317, lng: -121.004 }, // North edge of Westwood, where the forest roads start — no single named trailhead for this one, so this is the edge of town rather than Main Street
  18: { lat: 40.317, lng: -121.004 }, // North edge of Westwood, where the forest roads start — no single named trailhead for this one, so this is the edge of town rather than Main Street
  22: { lat: 40.46061, lng: -121.4594 }, // Kings Creek Falls trailhead
  23: { lat: 40.56385, lng: -121.3021 }, // Cinder Cone trailhead, Butte Lake
  24: { lat: 40.49807, lng: -121.42728 }, // Summit Lake trailhead (Terrace/Shadow/Cliff Lakes)
  25: { lat: 40.44304, lng: -121.39718 }, // Devils Kitchen / Boiling Springs Lake trailhead
  26: { lat: 40.35619, lng: -121.49123 }, // Spencer Meadows trailhead
  27: { lat: 40.68534, lng: -121.41919 }, // Subway Cave, Old Station
  28: { lat: 40.36092, lng: -121.35438 }, // Domingo Springs trailhead
  29: { lat: 40.4184, lng: -120.6610 }, // Susanville (Bizz Johnson Trail east end, ~25 mi from the Westwood end)
  30: { lat: 40.50241, lng: -121.16442 }, // Caribou Lake Trailhead
  31: { lat: 40.55118, lng: -121.20442 }, // Cone Lake trailhead
  32: { lat: 40.50242, lng: -121.16432 }, // Caribou Lake Trailhead (Gem Lake)
  33: { lat: 40.50241, lng: -121.16442 }, // Caribou Lake Trailhead
  34: { lat: 40.55118, lng: -121.20442 }, // Cone Lake trailhead
  35: { lat: 40.17927, lng: -121.09482 }, // Lake Almanor Recreation Trail (AllTrails marker, south end)
  36: { lat: 40.28408, lng: -121.02462 }, // Mountain Meadow Reservoir trailhead
  37: { lat: 40.53631, lng: -121.56257 }, // Manzanita Lake
  38: { lat: 40.45174, lng: -121.29696 }, // Juniper Lake Campground
  39: { lat: 40.30944, lng: -121.23231 }, // Collins Pine Nature Trail, Chester
  40: { lat: 40.26157, lng: -121.33886 }, // Hwy 36 Trailhead (Butt Mountain)
  41: { lat: 40.2836, lng: -121.0248 }, // Indian Ole Dam, Mountain Meadows Reservoir
  42: { lat: 40.2836, lng: -121.0248 }, // Indian Ole Dam, Mountain Meadows Reservoir
};
function coordsForActivity(a) {
  return ACTIVITY_COORDS[a.id] || LOCATION_COORDS[a.location];
}
function mapsUrl(coords, label) {
  if (coords) return `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(label + " CA")}`;
}
function directionsUrl(coords, label) {
  if (coords) return `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(label + " CA")}`;
}
function fmtHours(h) {
  if (h < 1) return `${Math.round(h * 60)} min`;
  return h % 1 === 0 ? `${h} hr${h === 1 ? "" : "s"}` : `${h} hrs`;
}
function fmtClock(startMinutes) {
  let h = Math.floor(startMinutes / 60) % 24;
  const m = startMinutes % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12; if (h === 0) h = 12;
  return `${h}:${m.toString().padStart(2, "0")} ${ampm}`;
}
function buildItineraryText({ itinerary, allActivities, numDays, needLodging }) {
  const lines = ["YOUR ALMANOR BASIN TRIP ITINERARY", ""];
  let anyDay = false;
  for (let d = 1; d <= numDays; d++) {
    const items = (itinerary[d] || []).map((id) => allActivities.find((a) => a.id === id)).filter(Boolean);
    if (!items.length) continue;
    anyDay = true;
    lines.push(`DAY ${d}`);
    let cursor = 480;
    items.forEach((a) => {
      const start = cursor;
      cursor += a.hours * 60;
      lines.push(`  ${fmtClock(start)} — ${a.title} (${a.location}, ${fmtHours(a.hours)})`);
      const vendor = a.vendorId && VENDORS.find((v) => v.id === a.vendorId);
      if (vendor) lines.push(`    Book guide: ${vendor.name} — ${vendor.url}`);
    });
    lines.push("");
  }
  if (!anyDay) lines.push("(No activities added yet.)", "");
  if (needLodging) {
    lines.push("NEED A PLACE TO STAY?");
    lines.push("  Open the Trip Builder on our site and toggle \"Need a place to stay?\" to see local resorts, RV parks, campgrounds, and hotels.");
    lines.push("");
  }
  return lines.join("\n");
}
async function trackVendorClick(vendorId) {
  const key = `vendor-click-count:${vendorId}`;
  try {
    let current = 0;
    try {
      const res = await window.storage.get(key, true);
      current = res ? parseInt(res.value, 10) || 0 : 0;
    } catch (e) { current = 0; }
    await window.storage.set(key, String(current + 1), true);
  } catch (e) { /* storage unavailable — demo still works, just won't persist */ }
}
async function loadVendorClickCounts(vendors) {
  const counts = {};
  for (const v of vendors) {
    try {
      const res = await window.storage.get(`vendor-click-count:${v.id}`, true);
      counts[v.id] = res ? parseInt(res.value, 10) || 0 : 0;
    } catch (e) {
      counts[v.id] = 0;
    }
  }
  return counts;
}

async function loadCustomTrails() {
  try {
    const listRes = await window.storage.list("custom-trail:", true);
    if (!listRes || !listRes.keys) return [];
    const trails = [];
    for (const key of listRes.keys) {
      try {
        const res = await window.storage.get(key, true);
        if (res) trails.push(JSON.parse(res.value));
      } catch (e) { /* skip unreadable entry */ }
    }
    trails.sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0));
    return trails;
  } catch (e) {
    return [];
  }
}
async function saveCustomTrail(trail) {
  try {
    await window.storage.set(`custom-trail:${trail.id}`, JSON.stringify(trail), true);
  } catch (e) { /* storage unavailable — demo still works, just won't persist */ }
}
async function deleteCustomTrail(id) {
  try {
    await window.storage.delete(`custom-trail:${id}`, true);
  } catch (e) { /* storage unavailable — demo still works, just won't persist */ }
}

/* Trip-in-progress persistence: uses localStorage (not window.storage) since
   this is meant to survive across page views on the same device/browser —
   exactly what localStorage is for, and unlike window.storage it's a real,
   always-available browser API on any hosting. */
const TRIP_STORAGE_KEY = "almanor-trip-in-progress";
function loadSavedTrip() {
  try {
    const raw = localStorage.getItem(TRIP_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}
function saveTrip(trip) {
  try {
    localStorage.setItem(TRIP_STORAGE_KEY, JSON.stringify(trip));
  } catch (e) { /* storage unavailable — trip just won't persist across visits */ }
}

/* ---------------------------------------------------------------- */
/* HELPERS                                                            */
/* ---------------------------------------------------------------- */

function fmtDate(d) {
  return d.toISOString().slice(0, 10);
}
function addDays(d, n) {
  const nd = new Date(d);
  nd.setDate(nd.getDate() + n);
  return nd;
}
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DOW = ["S","M","T","W","T","F","S"];

function distanceMiles(a, b) {
  const R = 3958.8;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLng = (b.lng - a.lng) * Math.PI / 180;
  const lat1 = a.lat * Math.PI / 180;
  const lat2 = b.lat * Math.PI / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function DistanceBadge({ userLocation, location, coords: coordsProp }) {
  const coords = coordsProp || LOCATION_COORDS[location];
  if (!userLocation || !coords) return null;
  const miles = distanceMiles(userLocation, coords);
  return <span className="distance-badge"><Compass size={11} /> ~{miles < 10 ? miles.toFixed(1) : Math.round(miles)} mi away</span>;
}

function LocationControl({ userLocation, setUserLocation }) {
  const [status, setStatus] = useState("idle"); // idle | loading | error
  const [manualTown, setManualTown] = useState("");

  function useMyLocation() {
    if (!navigator.geolocation) { setStatus("error"); return; }
    setStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, label: "Your current location" });
        setStatus("idle");
      },
      () => setStatus("error"),
      { timeout: 8000 }
    );
  }

  function pickTown(town) {
    setManualTown(town);
    if (!town) return;
    const c = LOCATION_COORDS[town];
    if (c) setUserLocation({ lat: c.lat, lng: c.lng, label: `Near ${town} (approximate)` });
  }

  return (
    <div className="location-control">
      <div className="location-control-row">
        <MapPin size={16} color="var(--pine)" />
        <div className="location-control-text">
          {userLocation ? (
            <>
              <span className="location-set">{userLocation.label}</span>
              <button className="link-arrow" onClick={() => { setUserLocation(null); setManualTown(""); setStatus("idle"); }}>Clear</button>
            </>
          ) : (
            <span className="muted">Set your location to see distances to each activity.</span>
          )}
        </div>
      </div>
      {!userLocation && (
        <div className="location-control-actions">
          <button className="btn btn-pine btn-sm" onClick={useMyLocation} disabled={status === "loading"}>
            {status === "loading" ? "Locating…" : <>Use my location</>}
          </button>
          <select value={manualTown} onChange={(e) => pickTown(e.target.value)}>
            <option value="">…or I'm staying near</option>
            {LOCATIONS.map((l) => <option value={l} key={l}>{l}</option>)}
          </select>
        </div>
      )}
      {status === "error" && <p className="form-fineprint">Couldn't get your location automatically — pick the nearest town instead.</p>}
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* TOPO BACKGROUND (signature element)                               */
/* ---------------------------------------------------------------- */

function TopoRings({ className = "", opacity = 0.5 }) {
  const rings = [40, 62, 84, 106, 128, 150];
  return (
    <svg className={className} viewBox="0 0 300 300" style={{ opacity }}>
      {rings.map((r, i) => (
        <circle key={i} cx="150" cy="150" r={r} fill="none" stroke="var(--gold)" strokeWidth="1" />
      ))}
    </svg>
  );
}

function TopoStripe() {
  return (
    <svg viewBox="0 0 1200 40" preserveAspectRatio="none" className="w-full h-6 block">
      <path d="M0,20 C100,5 200,35 300,20 C400,5 500,35 600,20 C700,5 800,35 900,20 C1000,5 1100,35 1200,20"
        fill="none" stroke="var(--gold)" strokeWidth="1.5" opacity="0.6" />
      <path d="M0,26 C100,11 200,41 300,26 C400,11 500,41 600,26 C700,11 800,41 900,26 C1000,11 1100,41 1200,26"
        fill="none" stroke="var(--gold)" strokeWidth="1" opacity="0.35" />
    </svg>
  );
}

/* ---------------------------------------------------------------- */
/* SHARED UI                                                          */
/* ---------------------------------------------------------------- */

function Eyebrow({ children, color = "var(--ember)" }) {
  return (
    <div className="eyebrow" style={{ color }}>
      <span className="eyebrow-line" style={{ background: color }} />
      {children}
    </div>
  );
}

function Nav({ view, setView }) {
  const [open, setOpen] = useState(false);
  const links = [
    { id: "home", label: "Home" },
    { id: "trip", label: "Trip Builder" },
    { id: "explore", label: "Trails & Guides" },
  ];
  return (
    <header className="nav">
      <div className="nav-inner">
        <button className="brand" onClick={() => { setView("home"); setOpen(false); }}>
          <Mountain size={20} strokeWidth={2.25} />
          <span>ALMANOR&nbsp;BASIN</span>
        </button>
        <nav className="nav-links">
          {links.map((l) => (
            <button key={l.id} className={`nav-link ${view === l.id ? "active" : ""}`} onClick={() => setView(l.id)}>
              {l.label}
            </button>
          ))}
          <button className="btn btn-ember btn-sm" onClick={() => setView("trip")}>Build a Trip</button>
        </nav>
        <button className="nav-burger" onClick={() => setOpen(!open)}><Menu size={22} /></button>
      </div>
      {open && (
        <div className="nav-mobile">
          {links.map((l) => (
            <button key={l.id} className="nav-mobile-link" onClick={() => { setView(l.id); setOpen(false); }}>{l.label}</button>
          ))}
          <button className="btn btn-ember" onClick={() => { setView("trip"); setOpen(false); }}>Build a Trip</button>
        </div>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <TopoStripe />
      <div className="footer-inner">
        <div>
          <div className="brand" style={{ color: "var(--paper)" }}>
            <Mountain size={20} />
            <span>ALMANOR&nbsp;BASIN</span>
          </div>
          <p className="footer-note">Trip planning, trails, and local guides around Lake Almanor, California.</p>
        </div>
        <div className="footer-col">
          <div className="footer-head">Contact</div>
          <div className="footer-line"><Phone size={14} /> (530) 555-0142</div>
          <div className="footer-line"><Mail size={14} /> hello@almanorbasin.com</div>
          <div className="footer-line"><MapPin size={14} /> 214 Peninsula Dr, Lake Almanor, CA</div>
        </div>
      </div>
      <div className="footer-bottom">Trail conditions, distances, and difficulty ratings are approximate — verify current conditions before you go.</div>
    </footer>
  );
}

/* ---------------------------------------------------------------- */
/* HOME                                                                */
/* ---------------------------------------------------------------- */

function CoverPhoto({ src, alt, className, children }) {
  const [broken, setBroken] = useState(!src);
  useEffect(() => setBroken(!src), [src]);
  return (
    <div className={className} style={{ position: "relative", overflow: "hidden", background: broken ? "linear-gradient(135deg, var(--pine), var(--granite))" : undefined }}>
      {!broken && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setBroken(true)}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
      )}
      {children}
    </div>
  );
}

function FeaturedGallery() {
  return (
    <section className="gallery-strip">
      <div className="gallery-strip-head">
        <Eyebrow color="var(--pine)">The whole basin</Eyebrow>
        <p className="gallery-strip-sub">Scroll through the areas we route trips across — from the lake itself out to Lassen Volcanic National Park.</p>
      </div>
      <div className="gallery-scroll">
        {HERO_GALLERY.map((g) => (
          <CoverPhoto className="gallery-card" key={g.location} src={LOCATION_IMAGES[g.location]} alt={g.caption}>
            <div className="gallery-card-overlay" />
            <div className="gallery-card-text">
              <div className="gallery-card-title">{g.caption}</div>
              <div className="gallery-card-sub">{g.sub}</div>
            </div>
          </CoverPhoto>
        ))}
      </div>
    </section>
  );
}

function Home({ setView }) {
  return (
    <div>
      <section className="hero hero-photo" style={{ backgroundImage: `linear-gradient(180deg, rgba(28,45,38,0.55), rgba(28,45,38,0.82)), url(${LOCATION_IMAGES["Lake Almanor"]})` }}>
        <div className="hero-inner">
          <Eyebrow color="var(--gold)">Lake Almanor, California · elev. 4,500 ft</Eyebrow>
          <h1 className="hero-title">One basin.<br/>However you want to spend it.</h1>
          <p className="hero-sub">Tell us how long you're here and what you're into, and we'll lay out a route across the whole basin — boating, fishing, hiking, biking, and off-roading included.</p>
          <div className="hero-signpost">
            <button className="sign sign-lake" onClick={() => setView("trip")}>
              <CalendarIcon size={18} />
              <span>Build a Trip</span>
              <ArrowRight size={16} />
            </button>
            <button className="sign sign-ember" onClick={() => setView("explore")}>
              <Compass size={18} />
              <span>Trails & Local Guides</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      <FeaturedGallery />

      <section className="section">
        <TopoStripe />
        <div className="section-inner grid-2">
          <div className="feature-card card-lake">
            <CalendarIcon size={22} />
            <h3>Trip Builder</h3>
            <p>Pick a length — a day, a weekend, a week — and what you're into, and get a day-by-day route across Almanor, Chester, Westwood, Silver Lake, Mountain Meadows Reservoir, and Lassen Volcanic National Park.</p>
            <button className="link-arrow" onClick={() => setView("trip")}>Build a trip <ArrowRight size={15} /></button>
          </div>
          <div className="feature-card card-ember">
            <Compass size={22} />
            <h3>Trails & Local Guides</h3>
            <p>A directory of real hiking and biking trails linked out to AllTrails, plus local fishing charters and guides for the activities we don't run ourselves.</p>
            <button className="link-arrow" onClick={() => setView("explore")}>See trails & guides <ArrowRight size={15} /></button>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="section-inner">
          <Eyebrow color="var(--pine)">Plan the trip</Eyebrow>
          <h2 className="section-title">Not sure what to do with a day, a weekend, or a week?</h2>
          <p className="section-sub">Tell the trip builder how long you're here and what you're into — hiking, fishing, biking, boating — and it'll lay out a route across Almanor, Chester, Westwood, Silver Lake, Mountain Meadows Reservoir, and Lassen Volcanic National Park.</p>
          <button className="btn btn-pine" onClick={() => setView("trip")}>Build a trip <ArrowRight size={16} /></button>
        </div>
      </section>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* TRIP BUILDER                                                        */
/* ---------------------------------------------------------------- */

function TripBuilder({ userLocation, setUserLocation }) {
  const savedTrip = useRef(loadSavedTrip()).current;
  const [durationId, setDurationId] = useState(savedTrip?.durationId || "weekend");
  const [interests, setInterests] = useState(new Set());
  const [locations, setLocations] = useState(new Set());
  const [itinerary, setItinerary] = useState(savedTrip?.itinerary || {}); // { [day]: [activityId, ...] }
  const [activeDay, setActiveDay] = useState(1);
  const [expandedId, setExpandedId] = useState(null);
  const [customTrails, setCustomTrails] = useState([]);
  const [needLodging, setNeedLodging] = useState(savedTrip?.needLodging || false);
  const [copied, setCopied] = useState(false);
  const [lengthFilter, setLengthFilter] = useState("all");
  const skipNextReset = useRef(true);

  const duration = DURATIONS.find((d) => d.id === durationId) || DURATIONS[0];
  const numDays = duration.days;
  const allActivities = useMemo(() => [...ACTIVITIES, ...customTrails, ...VENDOR_ACTIVITIES], [customTrails]);

  useEffect(() => {
    let live = true;
    loadCustomTrails().then((trails) => { if (live) setCustomTrails(trails); });
    return () => { live = false; };
  }, []);

  // Restoring a saved trip sets durationId on mount, which would otherwise
  // trip the reset-on-duration-change effect below and wipe the itinerary we
  // just restored — skip the very first run so only real user-driven duration
  // changes clear the plan.
  useEffect(() => {
    if (skipNextReset.current) { skipNextReset.current = false; return; }
    setItinerary({});
    setActiveDay(1);
    setExpandedId(null);
  }, [durationId]);

  // Save the in-progress trip (length + itinerary + lodging preference) so it's
  // still here if someone navigates to another page and comes back.
  useEffect(() => {
    saveTrip({ durationId, itinerary, needLodging });
  }, [durationId, itinerary, needLodging]);

  function toggle(set, setSet, val) {
    const next = new Set(set);
    next.has(val) ? next.delete(val) : next.add(val);
    setSet(next);
  }

  const wantInterests = interests.size ? interests : new Set(INTERESTS.map((i) => i.id));
  const wantLocations = locations.size ? locations : new Set(LOCATIONS);
  const lengthTest = (LENGTH_FILTERS.find((l) => l.id === lengthFilter) || LENGTH_FILTERS[0]).test;
  const pool = allActivities.filter((a) => wantLocations.has(a.location) && a.tags.some((t) => wantInterests.has(t)) && lengthTest(a.hours));

  const usedIds = useMemo(() => new Set(Object.values(itinerary).flat()), [itinerary]);

  function addToDay(activityId, day) {
    setItinerary((prev) => {
      const list = prev[day] || [];
      if (list.includes(activityId)) return prev;
      return { ...prev, [day]: [...list, activityId] };
    });
  }
  function removeFromDay(activityId, day) {
    setItinerary((prev) => ({ ...prev, [day]: (prev[day] || []).filter((id) => id !== activityId) }));
  }

  const dayItems = (itinerary[activeDay] || []).map((id) => allActivities.find((a) => a.id === id)).filter(Boolean);
  const dayHours = dayItems.reduce((sum, a) => sum + a.hours, 0);

  const hasItems = Object.values(itinerary).some((list) => list.length > 0);

  const itineraryText = useMemo(
    () => buildItineraryText({ itinerary, allActivities, numDays, needLodging }),
    [itinerary, allActivities, numDays, needLodging]
  );
  const mailtoHref = `mailto:?subject=${encodeURIComponent("My Almanor Basin Trip Itinerary")}&body=${encodeURIComponent(itineraryText)}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(itineraryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) { /* clipboard unavailable in this context */ }
  }

  function scrollToLodging() {
    document.getElementById("lodging-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  useEffect(() => {
    if (needLodging) scrollToLodging();
  }, [needLodging]);

  return (
    <div>
      <section className="page-hero page-hero-pine">
        <Eyebrow color="var(--gold)">Trip Builder</Eyebrow>
        <h1 className="page-title">Plan your time in the basin.</h1>
        <p className="page-sub">Pick a length, filter by what you're into and where, then click activities to add them to your day. Each one shows how long it takes, with a map and directions.</p>
      </section>

      <section className="section">
        <div className="section-inner trip-layout">
          <div className="trip-controls">
            <LocationControl userLocation={userLocation} setUserLocation={setUserLocation} />
            <div className="control-block">
              <div className="control-label">How long is the trip?</div>
              <div className="chip-row">
                {DURATIONS.map((d) => (
                  <button key={d.id} className={`chip ${durationId === d.id ? "chip-active-pine" : ""}`} onClick={() => setDurationId(d.id)}>{d.label}</button>
                ))}
              </div>
            </div>
            <div className="control-block">
              <div className="control-label">What are you into? <span className="control-hint">(leave blank for everything)</span></div>
              <div className="chip-row">
                {INTERESTS.map((i) => (
                  <button key={i.id} className={`chip ${interests.has(i.id) ? "chip-active-pine" : ""}`} onClick={() => toggle(interests, setInterests, i.id)}>
                    <i.icon size={14} /> {i.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="control-block">
              <div className="control-label">Where? <span className="control-hint">(leave blank for the whole basin)</span></div>
              <div className="chip-row">
                {LOCATIONS.map((l) => (
                  <button key={l} className={`chip ${locations.has(l) ? "chip-active-pine" : ""}`} onClick={() => toggle(locations, setLocations, l)}>
                    <MapPin size={14} /> {l}
                  </button>
                ))}
              </div>
            </div>
            <div className="control-block">
              <button className={`toggle-row ${needLodging ? "toggle-row-active" : ""}`} onClick={() => setNeedLodging(!needLodging)}>
                <span className={`toggle-switch ${needLodging ? "toggle-switch-on" : ""}`}><span className="toggle-knob" /></span>
                <span><Tent size={14} /> Need a place to stay?</span>
              </button>
              {needLodging && (
                <button className="link-arrow" style={{ marginTop: 8 }} onClick={scrollToLodging}>
                  View lodging options <ArrowRight size={13} />
                </button>
              )}
            </div>
          </div>

          <div className="trip-result">
            {numDays > 1 && (
              <div className="day-tabs">
                {Array.from({ length: numDays }, (_, i) => i + 1).map((d) => {
                  const h = (itinerary[d] || []).reduce((s, id) => s + (allActivities.find((a) => a.id === id)?.hours || 0), 0);
                  return (
                    <button key={d} className={`day-tab ${activeDay === d ? "day-tab-active" : ""}`} onClick={() => setActiveDay(d)}>
                      Day {d}{h > 0 && <span className="day-tab-hours">{fmtHours(h)}</span>}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="itin-panel">
              <div className="itin-panel-head">
                <span>Day {activeDay} plan</span>
                <span className={`itin-hours ${dayHours > 8 ? "itin-hours-over" : ""}`}>{fmtHours(dayHours)} planned{dayHours > 8 ? " · long day" : ""}</span>
              </div>
              {dayItems.length === 0 ? (
                <div className="itin-empty">Nothing added yet — pick something below to start building Day {activeDay}.</div>
              ) : (
                <div className="itin-list">
                  {(() => {
                    let cursor = 480; // 8:00 AM in minutes
                    return dayItems.map((a) => {
                      const start = cursor;
                      cursor += a.hours * 60;
                      const vendor = a.vendorId && VENDORS.find((v) => v.id === a.vendorId);
                      return (
                        <div className="itin-item" key={a.id}>
                          <div className="itin-item-time">{fmtClock(start)}</div>
                          <div className="itin-item-body">
                            <div className="itin-item-loc"><MapPin size={11} /> {a.location} · {fmtHours(a.hours)} <DistanceBadge userLocation={userLocation} coords={coordsForActivity(a)} /></div>
                            <div className="itin-item-title">{a.title}</div>
                            {vendor && <div className="itin-slot-gear">Guided trip — book with operator</div>}
                            {vendor && <a className="link-arrow itin-item-reserve" href={`${vendor.url}${vendor.url.includes("?") ? "&" : "?"}utm_source=almanorbasin&utm_medium=referral&utm_campaign=trip_builder`} target="_blank" rel="noopener noreferrer" onClick={() => trackVendorClick(vendor.id)}>Book with {vendor.name} <ExternalLink size={12} /></a>}
                          </div>
                          <button className="itin-item-remove" onClick={() => removeFromDay(a.id, activeDay)} aria-label="Remove"><X size={14} /></button>
                        </div>
                      );
                    });
                  })()}
                </div>
              )}
            </div>

            {hasItems && (
              <div className="gear-summary share-panel share-panel-top">
                <div className="control-label">Get this itinerary</div>
                <p className="section-sub" style={{ marginBottom: 14 }}>Send it to yourself, copy it into notes, or print it — booking links for every guide are included. Your plan is also saved automatically on this device, so it's still here if you browse other pages and come back.</p>
                <div className="share-actions">
                  <a href={mailtoHref} className="btn btn-pine btn-sm"><Mail size={14} /> Email me this itinerary</a>
                  <button className="btn btn-ghost btn-sm" onClick={handleCopy}>{copied ? <><Check size={14} /> Copied</> : <>Copy as text</>}</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => window.print()}>Print / Save as PDF</button>
                </div>
              </div>
            )}

            <div className="control-label" style={{ marginTop: 28 }}>Things to do{pool.length !== allActivities.length ? "" : " around the basin"}</div>
            <div className="chip-row" style={{ marginBottom: 16 }}>
              {LENGTH_FILTERS.map((l) => (
                <button key={l.id} className={`chip ${lengthFilter === l.id ? "chip-active-pine" : ""}`} onClick={() => setLengthFilter(l.id)}>
                  <Clock size={13} /> {l.label}
                </button>
              ))}
            </div>
            {pool.length === 0 ? (
              <div className="itin-empty">No activities match these filters — try widening the length, interests, or location.</div>
            ) : (
            <div className="activity-grid">
              {pool.map((a) => {
                const added = (itinerary[activeDay] || []).includes(a.id);
                const expanded = expandedId === a.id;
                const vendor = a.vendorId ? VENDORS.find((v) => v.id === a.vendorId) : null;
                return (
                  <div className={`activity-card ${expanded ? "activity-card-open" : ""}`} key={a.id}>
                    <CoverPhoto className="activity-card-photo" src={imageForActivity(a)} alt={`${a.title} — ${a.location}, CA`} />
                    <button className="activity-card-main" onClick={() => setExpandedId(expanded ? null : a.id)}>
                      <div className="itin-item-loc"><MapPin size={11} /> {a.location} · {fmtHours(a.hours)} <DistanceBadge userLocation={userLocation} coords={coordsForActivity(a)} /></div>
                      <div className="itin-item-title">{a.title}</div>
                      {a.trail && <div className="trail-meta trail-meta-sm"><span>{a.distance}</span><span className="trail-dot">·</span><span>{a.difficulty}</span></div>}
                      {vendor && <div className="itin-slot-gear">Fishing Charter — guided trip</div>}
                      <p className="itin-slot-desc itin-slot-desc-collapsed">{a.desc}</p>
                    </button>
                    {expanded && (
                      <div className="activity-detail">
                        <div className="activity-detail-links">
                          <a href={mapsUrl(coordsForActivity(a), a.location)} target="_blank" rel="noopener noreferrer" className="link-arrow"><MapPin size={13} /> View on map</a>
                          <a href={directionsUrl(coordsForActivity(a), a.location)} target="_blank" rel="noopener noreferrer" className="link-arrow"><ArrowRight size={13} /> Get directions</a>
                          {a.trail && <a href={trailLinkFor(a)} target="_blank" rel="noopener noreferrer" className="link-arrow"><ExternalLink size={13} /> View on AllTrails</a>}
                          {!a.trail && a.sourceUrl && <a href={a.sourceUrl} target="_blank" rel="noopener noreferrer" className="link-arrow"><ExternalLink size={13} /> More info</a>}
                          {vendor && <a href={`${vendor.url}${vendor.url.includes("?") ? "&" : "?"}utm_source=almanorbasin&utm_medium=referral&utm_campaign=trip_builder`} target="_blank" rel="noopener noreferrer" className="link-arrow" onClick={() => trackVendorClick(vendor.id)}><ExternalLink size={13} /> Visit {vendor.name}</a>}
                        </div>
                        <p className="form-fineprint">Map links are approximate, for trip-planning purposes.</p>
                      </div>
                    )}
                    <button className={`btn btn-sm ${added ? "btn-ghost" : "btn-pine"} activity-add`} disabled={added} onClick={() => addToDay(a.id, activeDay)}>
                      {added ? <><Check size={14} /> Added to Day {activeDay}</> : <>Add to Day {activeDay}</>}
                    </button>
                  </div>
                );
              })}
            </div>
            )}

            {needLodging && (
              <div className="gear-summary" id="lodging-section" style={{ marginTop: 28, scrollMarginTop: 90 }}>
                <div className="control-label">Where to stay</div>
                <div className="lodging-grid">
                  {LODGING.filter((l) => (locations.size ? locations.has(l.location) : true)).map((l) => (
                    <div className="lodging-card" key={l.id}>
                      <div className="itin-item-loc"><MapPin size={11} /> {l.location} <DistanceBadge userLocation={userLocation} location={l.location} /></div>
                      <div className="trail-card-title" style={{ fontSize: 16 }}>{l.name}</div>
                      <span className="fleet-tag">{l.category}</span>
                      <p className="itin-slot-desc">{l.desc}</p>
                      <a
                        href={`${l.url}${l.url.includes("?") ? "&" : "?"}utm_source=almanorbasin&utm_medium=referral&utm_campaign=lodging`}
                        target="_blank" rel="noopener noreferrer" className="link-arrow"
                        onClick={() => trackVendorClick(l.id)}
                      >
                        <ExternalLink size={13} /> Visit website
                      </a>
                    </div>
                  ))}
                </div>
                <p className="form-fineprint" style={{ marginTop: 10 }}>Contact each property directly for current rates and availability.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* EXPLORE — TRAILS & LOCAL GUIDES                                     */
/* ---------------------------------------------------------------- */

const EMPTY_TRAIL_FORM = { title: "", location: "", tags: [], difficulty: "Moderate", distance: "", hours: 2, desc: "", alltrailsUrl: "" };

function ExplorePage({ userLocation, setUserLocation }) {
  const [activityFilter, setActivityFilter] = useState("all");
  const [clickCounts, setClickCounts] = useState({});
  const [customTrails, setCustomTrails] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState(EMPTY_TRAIL_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let live = true;
    loadVendorClickCounts(VENDORS).then((counts) => { if (live) setClickCounts(counts); });
    loadCustomTrails().then((trails) => { if (live) setCustomTrails(trails); });
    return () => { live = false; };
  }, []);

  const allTrails = [...ACTIVITIES.filter((a) => a.trail), ...customTrails];
  const filteredTrails = activityFilter === "all" ? allTrails : allTrails.filter((t) => t.tags.includes(activityFilter));

  function handleVendorClick(vendorId) {
    trackVendorClick(vendorId);
    setClickCounts((prev) => ({ ...prev, [vendorId]: (prev[vendorId] || 0) + 1 }));
  }

  function toggleTag(tagId) {
    setForm((f) => ({ ...f, tags: f.tags.includes(tagId) ? f.tags.filter((t) => t !== tagId) : [...f.tags, tagId] }));
  }

  async function handleAddTrail() {
    if (!form.title || !form.location || form.tags.length === 0) return;
    setSaving(true);
    const trail = {
      id: `custom-${Date.now()}`,
      location: form.location,
      title: form.title,
      tags: form.tags,
      gear: null,
      hours: Number(form.hours) || 1,
      distance: form.distance || "—",
      difficulty: form.difficulty,
      desc: form.desc || "Added via the trail upload form.",
      trail: true,
      custom: true,
      alltrailsUrl: form.alltrailsUrl || undefined,
      addedAt: Date.now(),
    };
    await saveCustomTrail(trail);
    setCustomTrails((prev) => [trail, ...prev]);
    setForm(EMPTY_TRAIL_FORM);
    setShowAddForm(false);
    setSaving(false);
  }

  async function handleDeleteTrail(id) {
    setCustomTrails((prev) => prev.filter((t) => t.id !== id));
    await deleteCustomTrail(id);
  }

  return (
    <div>
      <section className="page-hero page-hero-pine">
        <Eyebrow color="var(--gold)">Trails & Local Guides</Eyebrow>
        <h1 className="page-title">More ground than we can cover ourselves.</h1>
        <p className="page-sub">A directory of real hiking and biking trails around the basin, linked out to AllTrails for maps and reviews — plus local guides and charters for the activities we don't run ourselves.</p>
      </section>

      <section className="section">
        <div className="section-inner">
          <LocationControl userLocation={userLocation} setUserLocation={setUserLocation} />
          <div className="explore-head-row" style={{ marginTop: 20 }}>
            <div>
              <Eyebrow color="var(--pine)">Trail directory</Eyebrow>
              <h2 className="section-title">Hiking & biking</h2>
            </div>
            <button className="btn btn-pine btn-sm" onClick={() => setShowAddForm(!showAddForm)}>
              {showAddForm ? <>Cancel</> : <>+ Add a trail</>}
            </button>
          </div>
          <p className="section-sub">We link out to AllTrails for the map, GPS track, and current reviews on each trail rather than duplicating their data. Found one on AllTrails yourself? Paste its link in below and it'll show up here.</p>

          {showAddForm && (
            <div className="add-trail-panel">
              <div className="field-row">
                <label className="field"><span>Trail name</span><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Willow Lake Trail" /></label>
                <label className="field"><span>Location / area</span><input list="location-options" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Caribou Wilderness" />
                  <datalist id="location-options">{LOCATIONS.map((l) => <option value={l} key={l} />)}</datalist>
                </label>
              </div>
              <div className="field-row">
                <label className="field"><span>Distance</span><input value={form.distance} onChange={(e) => setForm({ ...form, distance: e.target.value })} placeholder="4.2 mi round trip" /></label>
                <label className="field"><span>Difficulty</span>
                  <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
                    <option>Easy</option><option>Moderate</option><option>Strenuous</option>
                  </select>
                </label>
                <label className="field"><span>Time (hrs)</span><input type="number" step="0.5" min="0.5" value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} /></label>
              </div>
              <div className="field">
                <span>Type</span>
                <div className="chip-row">
                  {INTERESTS.map((i) => (
                    <button key={i.id} className={`chip ${form.tags.includes(i.id) ? "chip-active-pine" : ""}`} onClick={() => toggleTag(i.id)} type="button">
                      <i.icon size={14} /> {i.label}
                    </button>
                  ))}
                </div>
              </div>
              <label className="field"><span>Description</span><input value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} placeholder="Short note on what makes this trail worth doing" /></label>
              <label className="field"><span>AllTrails link <span className="control-hint">(optional — paste the URL from the trail's AllTrails page)</span></span><input value={form.alltrailsUrl} onChange={(e) => setForm({ ...form, alltrailsUrl: e.target.value })} placeholder="https://www.alltrails.com/trail/..." /></label>
              <button className="btn btn-pine" disabled={!form.title || !form.location || form.tags.length === 0 || saving} onClick={handleAddTrail}>
                {saving ? "Saving…" : <>Save trail <ArrowRight size={16} /></>}
              </button>
              <p className="form-fineprint">Trails you add are saved in your browser so they're still here next time you visit.</p>
            </div>
          )}

          <div className="chip-row" style={{ marginBottom: 20, marginTop: 20 }}>
            <button className={`chip ${activityFilter === "all" ? "chip-active-pine" : ""}`} onClick={() => setActivityFilter("all")}>All</button>
            <button className={`chip ${activityFilter === "hiking" ? "chip-active-pine" : ""}`} onClick={() => setActivityFilter("hiking")}><Mountain size={14} /> Hiking</button>
            <button className={`chip ${activityFilter === "biking" ? "chip-active-pine" : ""}`} onClick={() => setActivityFilter("biking")}><Bike size={14} /> Biking</button>
            <button className={`chip ${activityFilter === "sightseeing" ? "chip-active-pine" : ""}`} onClick={() => setActivityFilter("sightseeing")}><Sun size={14} /> Short & scenic</button>
          </div>
          <div className="trail-grid">
            {filteredTrails.map((t) => (
              <div className="trail-card" key={t.id}>
                <CoverPhoto className="trail-card-photo" src={imageForActivity(t)} alt={`${t.title} trail — ${t.location}, CA`} />
                <div className="trail-card-body">
                  <div className="trail-card-head">
                    <div className="itin-item-loc"><MapPin size={11} /> {t.location} <DistanceBadge userLocation={userLocation} coords={coordsForActivity(t)} /></div>
                    {t.custom && (
                      <button className="trail-delete" onClick={() => handleDeleteTrail(t.id)} aria-label="Remove trail" title="Remove this trail"><X size={13} /></button>
                    )}
                  </div>
                  <h3 className="trail-card-title">{t.title}</h3>
                  <div className="trail-meta">
                    <span>{t.distance}</span>
                    <span className="trail-dot">·</span>
                    <span>{t.difficulty}</span>
                    <span className="trail-dot">·</span>
                    <span>{fmtHours(t.hours)}</span>
                  </div>
                  <p className="itin-slot-desc">{t.desc}</p>
                  <div className="activity-detail-links">
                    <a href={trailLinkFor(t)} target="_blank" rel="noopener noreferrer" className="link-arrow">
                      <ExternalLink size={13} /> View on AllTrails
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="form-fineprint" style={{ marginTop: 8 }}>Distances and difficulty are approximate — verify current trail conditions before you go.</p>
        </div>
      </section>

      <section className="section section-alt">
        <div className="section-inner">
          <Eyebrow color="var(--ember)">Local guides & charters</Eyebrow>
          <h2 className="section-title">Activities we don't run ourselves</h2>
          <p className="section-sub">Local charters and guide services for fishing trips around Lake Almanor — book directly with the operator.</p>
          <div className="vendor-grid">
            {VENDORS.map((v) => (
              <div className="vendor-card" key={v.id}>
                <CoverPhoto className="vendor-card-photo" src={LOCATION_IMAGES[v.location]} alt={`${v.name} — ${v.category} on ${v.location}, CA`} />
                <div className="vendor-card-body">
                  <div className="vendor-card-top">
                    <Fish size={18} color="var(--ember)" />
                    <span className="fleet-tag">{v.category}</span>
                  </div>
                  <h3 className="trail-card-title">{v.name}</h3>
                  <div className="itin-item-loc"><MapPin size={11} /> {v.location} <DistanceBadge userLocation={userLocation} location={v.location} /></div>
                  <p className="itin-slot-desc">{v.desc}</p>
                  <div className="vendor-card-bottom">
                    <a
                      href={`${v.url}${v.url.includes("?") ? "&" : "?"}utm_source=almanorbasin&utm_medium=referral&utm_campaign=partner_directory`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-ember btn-sm"
                      onClick={() => handleVendorClick(v.id)}
                    >
                      Visit website <ExternalLink size={13} />
                    </a>
                    <span className="click-badge"><TrendingUp size={12} /> {clickCounts[v.id] ?? "…"} clicks tracked</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="form-fineprint" style={{ marginTop: 14 }}>Click counts shown here are tracked in your browser, as an example of the kind of data a referral tracking system would report.</p>
        </div>
      </section>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* ROOT                                                                */
/* ---------------------------------------------------------------- */

/* Every "page" below is really just a state change on one URL — there is no
   router, so Google can only ever index this single address. The per-view
   title/description swap in the effect below is a nice-to-have for browser
   tabs and for whatever slice of the page Google's renderer happens to see;
   the load-bearing SEO surface is the static, keyword-comprehensive baseline
   set on mount (SITE_TITLE/SITE_DESCRIPTION/JSON-LD below), since that's what
   actually gets indexed. Ranking separately for individual activity searches
   (e.g. "Lassen hiking," "Lake Almanor trip planner") would need real,
   separate URLs per category — see SEO_STRATEGY_NOTES.md. */
const SITE_URL = "https://www.adventurealmanor.com/";
const SITE_TITLE = "Lake Almanor Trip Planner | Boating, Fishing & Hiking";
const SITE_DESCRIPTION = "Free trip planning for boating, fishing, hiking, biking, and off-roading around Lake Almanor, CA — plus real hiking trails and local guides.";
const SEO_VIEWS = {
  home: { title: SITE_TITLE, description: SITE_DESCRIPTION },
  trip: { title: "Lake Almanor Trip Builder | Custom Itineraries", description: "Build a custom day, weekend, or week-long Lake Almanor itinerary — boating, fishing, hiking, biking, and off-roading, matched to your trip." },
  explore: { title: "Hiking Trails & Fishing Guides Near Lake Almanor", description: "Real hiking and biking trails around Lake Almanor and Lassen Volcanic NP, linked to AllTrails, plus local fishing charters and guides." },
};

export default function AlmanorTripPlannerSite() {
  const [view, setView] = useState("home");
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@600;700;800&family=Work+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  // Static, once-per-load SEO baseline: canonical/OG/Twitter tags + JSON-LD.
  // This is what non-JS crawlers and link-preview bots (Facebook, Slack, iMessage)
  // actually see, since they don't execute the per-view title effect below.
  useEffect(() => {
    const created = [];
    function setMeta(attr, key, content) {
      let el = document.head.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
        created.push(el);
      }
      el.setAttribute("content", content);
    }
    setMeta("name", "description", SITE_DESCRIPTION);
    setMeta("name", "robots", "index, follow");
    setMeta("property", "og:type", "website");
    setMeta("property", "og:site_name", "Almanor Basin Trip Planner");
    setMeta("property", "og:title", SITE_TITLE);
    setMeta("property", "og:description", SITE_DESCRIPTION);
    setMeta("property", "og:url", SITE_URL);
    setMeta("property", "og:image", LOCATION_IMAGES["Lake Almanor"]);
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", SITE_TITLE);
    setMeta("name", "twitter:description", SITE_DESCRIPTION);
    setMeta("name", "twitter:image", LOCATION_IMAGES["Lake Almanor"]);

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
      created.push(canonical);
    }
    canonical.href = SITE_URL;

    const jsonLd = document.createElement("script");
    jsonLd.type = "application/ld+json";
    jsonLd.text = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          name: "Almanor Basin Trip Planner",
          url: SITE_URL,
          description: SITE_DESCRIPTION,
        },
        ...LOCATIONS.map((loc) => ({
          "@type": "TouristAttraction",
          name: loc,
          geo: { "@type": "GeoCoordinates", latitude: LOCATION_COORDS[loc].lat, longitude: LOCATION_COORDS[loc].lng },
          isAccessibleForFree: true,
        })),
      ],
    });
    document.head.appendChild(jsonLd);
    created.push(jsonLd);

    return () => created.forEach((el) => el.remove());
  }, []);

  // Per-view title/description — a supplementary touch for browser tabs and
  // in-app sharing; see the note above the SEO_VIEWS declaration.
  useEffect(() => {
    const seo = SEO_VIEWS[view] || SEO_VIEWS.home;
    document.title = seo.title;
    const descTag = document.head.querySelector('meta[name="description"]');
    if (descTag) descTag.setAttribute("content", seo.description);
  }, [view]);

  return (
    <div className="site">
      <style>{`
        :root{
          --paper:#F2EEE2; --ink:#23241F; --pine:#1F3D2E; --pine-2:#16302329;
          --lake:#1D5C6B; --ember:#C1622D; --granite:#6B6558; --gold:#B8923D;
          --paper-2:#E9E3D2;
        }
        .site{ font-family:'Work Sans',sans-serif; color:var(--ink); background:var(--paper); }
        .site h1,.site h2,.site h3{ font-family:'Big Shoulders Display',sans-serif; text-transform:uppercase; letter-spacing:0.01em; line-height:0.95; margin:0; }
        .muted{ color:var(--granite); font-size:14px; }
        button{ font-family:inherit; cursor:pointer; }

        .eyebrow{ display:flex; align-items:center; gap:8px; font-family:'JetBrains Mono',monospace; font-size:12px; letter-spacing:0.14em; text-transform:uppercase; margin-bottom:14px; font-weight:500; }
        .eyebrow-line{ width:22px; height:2px; display:inline-block; }

        .btn{ display:inline-flex; align-items:center; gap:8px; padding:13px 22px; border-radius:3px; font-weight:600; font-size:14px; border:none; transition:transform .15s, opacity .15s; }
        .btn:hover:not(:disabled){ transform:translateY(-1px); }
        .btn:disabled{ opacity:0.4; cursor:not-allowed; }
        .btn-sm{ padding:9px 15px; font-size:13px; }
        .btn-ember{ background:var(--ember); color:var(--paper); }
        .btn-lake{ background:var(--lake); color:var(--paper); }
        .btn-pine{ background:var(--pine); color:var(--paper); }
        .btn-ghost{ background:transparent; color:var(--ink); border:1.5px solid var(--granite); }

        /* nav */
        .nav{ position:sticky; top:0; z-index:40; background:var(--pine); color:var(--paper); }
        .nav-inner{ max-width:1180px; margin:0 auto; display:flex; align-items:center; justify-content:space-between; padding:16px 24px; }
        .brand{ display:flex; align-items:center; gap:8px; background:none; border:none; color:inherit; font-family:'Big Shoulders Display',sans-serif; font-weight:700; letter-spacing:0.04em; font-size:16px; }
        .nav-links{ display:flex; align-items:center; gap:6px; }
        .nav-link{ background:none; border:none; color:var(--paper-2); padding:8px 12px; font-size:14px; border-radius:3px; opacity:0.8; }
        .nav-link.active,.nav-link:hover{ opacity:1; background:rgba(255,255,255,0.08); }
        .nav-burger{ display:none; background:none; border:none; color:var(--paper); }
        .nav-mobile{ display:none; }
        @media (max-width:860px){
          .nav-links{ display:none; }
          .nav-burger{ display:block; }
          .nav-mobile{ display:flex; flex-direction:column; gap:4px; padding:0 24px 18px; }
          .nav-mobile-link{ background:none; border:none; color:var(--paper-2); text-align:left; padding:10px 0; font-size:15px; }
        }

        /* hero */
        .hero{ position:relative; overflow:hidden; background:var(--pine); color:var(--paper); padding:88px 24px 72px; }
        .hero-photo{ background-size:cover; background-position:center; }
        .hero-rings{ position:absolute; right:-60px; top:-60px; width:420px; height:420px; }
        .hero-inner{ max-width:720px; margin:0 auto; text-align:center; position:relative; }
        .hero-title{ font-size:clamp(40px,6vw,68px); margin-bottom:20px; }
        .hero-sub{ font-size:17px; color:var(--paper-2); max-width:520px; margin:0 auto 34px; line-height:1.5; }
        .hero-signpost{ display:flex; gap:16px; justify-content:center; flex-wrap:wrap; }
        .sign{ display:flex; align-items:center; gap:10px; padding:16px 22px; border-radius:3px; font-weight:600; font-size:15px; border:1.5px solid rgba(255,255,255,0.25); color:var(--paper); background:rgba(255,255,255,0.06); }
        .sign-lake:hover{ background:var(--lake); border-color:var(--lake); }
        .sign-ember:hover{ background:var(--ember); border-color:var(--ember); }

        /* featured areas photo gallery, scrolls horizontally from Lake Almanor to Lassen NP & beyond */
        .gallery-strip{ background:var(--paper); padding:36px 24px 8px; }
        .gallery-strip-head{ max-width:1180px; margin:0 auto 18px; }
        .gallery-strip-sub{ color:var(--granite); font-size:14.5px; max-width:520px; margin-top:6px; }
        .gallery-scroll{ display:flex; gap:14px; overflow-x:auto; overflow-y:hidden; padding:4px 24px 28px; scroll-snap-type:x proximity; -webkit-overflow-scrolling:touch; scrollbar-width:thin; scrollbar-color:var(--pine) transparent; }
        .gallery-scroll::-webkit-scrollbar{ height:7px; }
        .gallery-scroll::-webkit-scrollbar-thumb{ background:#CFC7B2; border-radius:4px; }
        .gallery-card{ flex:0 0 auto; width:280px; height:190px; border-radius:8px; position:relative; scroll-snap-align:start; box-shadow:0 1px 3px rgba(0,0,0,0.15); }
        .gallery-card-overlay{ position:absolute; inset:0; background:linear-gradient(180deg, rgba(28,45,38,0) 40%, rgba(20,32,27,0.88)); }
        .gallery-card-text{ position:absolute; left:0; right:0; bottom:0; padding:14px; color:#fff; }
        .gallery-card-title{ font-family:'Big Shoulders Display',sans-serif; font-weight:700; font-size:19px; line-height:1.1; }
        .gallery-card-sub{ font-size:12px; color:#E4E9E1; margin-top:4px; max-width:230px; line-height:1.4; }
        @media (max-width:560px){ .gallery-card{ width:230px; height:160px; } }

        /* sections */
        .section{ padding:64px 24px; }
        .section-alt{ background:var(--paper-2); }
        .section-inner{ max-width:1180px; margin:0 auto; }
        .section-title{ font-size:clamp(28px,4vw,42px); margin:6px 0 16px; }
        .section-sub{ max-width:560px; color:var(--granite); font-size:16px; line-height:1.55; margin-bottom:26px; }
        .grid-2{ display:grid; grid-template-columns:1fr 1fr; gap:22px; }
        @media (max-width:860px){ .grid-2{ grid-template-columns:1fr; } }

        .feature-card{ padding:28px; border-radius:6px; background:var(--paper); border:1px solid #DDD5BF; }
        .feature-card h3{ font-size:22px; margin:14px 0 10px; text-transform:none; }
        .feature-card p{ color:var(--granite); font-size:14.5px; line-height:1.55; margin-bottom:16px; }
        .card-lake{ border-top:3px solid var(--lake); }
        .card-ember{ border-top:3px solid var(--ember); }
        .link-arrow{ background:none; border:none; display:inline-flex; align-items:center; gap:6px; font-weight:600; font-size:13.5px; color:var(--ink); padding:0; }

        /* page hero (sub-pages) */
        .page-hero{ padding:60px 24px 44px; color:var(--paper); }
        .page-hero-pine{ background:var(--pine); }
        .page-title{ font-size:clamp(32px,5vw,52px); max-width:680px; margin:6px 0 14px; }
        .page-sub{ max-width:560px; font-size:15.5px; color:rgba(255,255,255,0.88); line-height:1.55; }

        .field{ display:flex; flex-direction:column; gap:6px; font-size:13px; font-weight:600; }
        .field input,.field select{ font-family:inherit; padding:11px 12px; border-radius:4px; border:1.5px solid #DDD5BF; background:var(--paper); font-size:14.5px; font-weight:400; }
        .field-row{ display:flex; gap:12px; }
        .field-row .field{ flex:1; }
        .form-fineprint{ font-size:12px; color:var(--granite); }

        /* trip builder */
        .trip-layout{ display:grid; grid-template-columns:280px 1fr; gap:30px; align-items:start; }
        .trip-controls{ display:flex; flex-direction:column; gap:22px; position:sticky; top:90px; align-self:start; z-index:1; max-height:calc(100vh - 110px); overflow-y:auto; overflow-x:hidden; padding-right:6px; scrollbar-width:thin; scrollbar-color:var(--granite) transparent; }
        .trip-controls::-webkit-scrollbar{ width:6px; }
        .trip-controls::-webkit-scrollbar-thumb{ background:#CFC7B2; border-radius:3px; }
        .trip-controls::-webkit-scrollbar-track{ background:transparent; }
        @media (max-width:900px){
          .trip-layout{ grid-template-columns:1fr; }
          .trip-controls{ position:static; background:var(--paper-2); padding:18px; border-radius:6px; margin-bottom:8px; max-height:none; overflow-y:visible; }
        }
        .control-label{ font-weight:700; font-size:13.5px; margin-bottom:10px; }
        .control-hint{ font-weight:400; color:var(--granite); font-size:12px; }
        .chip-row{ display:flex; flex-wrap:wrap; gap:8px; }
        .chip{ display:flex; align-items:center; gap:6px; padding:8px 13px; border-radius:20px; border:1.5px solid #DDD5BF; background:var(--paper); font-size:13px; font-weight:600; }
        .chip-active-pine{ background:var(--pine); border-color:var(--pine); color:#fff; }

        .trip-result{ min-width:0; }
        .day-tabs{ display:flex; gap:8px; flex-wrap:wrap; margin-bottom:16px; }
        .day-tab{ display:flex; flex-direction:column; align-items:flex-start; gap:2px; padding:8px 14px; border-radius:6px; border:1.5px solid #DDD5BF; background:var(--paper); font-weight:700; font-size:13px; }
        .day-tab-active{ background:var(--pine); border-color:var(--pine); color:#fff; }
        .day-tab-hours{ font-family:'JetBrains Mono',monospace; font-weight:400; font-size:10.5px; opacity:0.8; }

        .itin-panel{ background:var(--paper-2); border-radius:6px; padding:18px; }
        .itin-panel-head{ display:flex; justify-content:space-between; align-items:center; font-weight:700; font-size:14.5px; margin-bottom:12px; }
        .itin-hours{ font-family:'JetBrains Mono',monospace; font-weight:600; font-size:12px; color:var(--pine); background:#DCE6DD; padding:4px 9px; border-radius:20px; }
        .itin-hours-over{ background:#F0DCC9; color:var(--ember); }
        .itin-empty{ font-size:13.5px; color:var(--granite); padding:14px 0; }
        .itin-list{ display:flex; flex-direction:column; gap:10px; }
        .itin-item{ display:flex; gap:12px; align-items:flex-start; background:var(--paper); border:1px solid #DDD5BF; border-radius:6px; padding:12px 14px; }
        .itin-item-time{ font-family:'JetBrains Mono',monospace; font-size:11px; font-weight:700; color:var(--pine); white-space:nowrap; padding-top:2px; }
        .itin-item-body{ flex:1; }
        .itin-item-loc{ display:flex; align-items:center; gap:4px; font-size:11px; font-weight:600; color:var(--pine); text-transform:uppercase; letter-spacing:0.04em; margin-bottom:4px; }
        .itin-item-title{ font-weight:700; font-size:14.5px; }
        .itin-item-remove{ background:none; border:none; color:var(--granite); padding:2px; }
        .itin-item-remove:hover{ color:var(--ember); }
        .itin-slot-desc{ font-size:13.5px; color:var(--granite); line-height:1.5; margin-bottom:6px; }
        .itin-slot-desc-collapsed{ margin-top:6px; margin-bottom:0; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
        .itin-slot-gear{ font-size:12px; font-weight:600; color:var(--ember); margin-top:2px; }

        .activity-grid{ display:grid; grid-template-columns:repeat(2,1fr); gap:14px; margin-top:12px; }
        @media (max-width:700px){ .activity-grid{ grid-template-columns:1fr; } }
        .activity-card{ background:var(--paper); border:1px solid #DDD5BF; border-radius:6px; display:flex; flex-direction:column; overflow:hidden; }
        .activity-card-open{ border-color:var(--pine); }
        .activity-card-photo{ height:120px; background-color:#DDD5BF; }
        .activity-card-main{ text-align:left; background:none; border:none; padding:14px 16px 10px; }
        .activity-detail{ padding:0 16px 12px; }
        .activity-detail-links{ display:flex; gap:16px; margin:6px 0; }
        .activity-add{ margin:0 16px 14px; }

        .gear-summary{ background:var(--paper-2); border-radius:6px; padding:20px; }

        /* explore: trails & vendors */
        .fleet-tag{ font-family:'JetBrains Mono',monospace; font-size:11px; letter-spacing:0.1em; text-transform:uppercase; color:var(--ember); margin:10px 0 6px; }
        .trail-grid{ display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
        @media (max-width:900px){ .trail-grid{ grid-template-columns:1fr 1fr; } }
        @media (max-width:620px){ .trail-grid{ grid-template-columns:1fr; } }
        .trail-card{ background:var(--paper); border:1px solid #DDD5BF; border-radius:6px; overflow:hidden; display:flex; flex-direction:column; }
        .trail-card-photo{ height:130px; background-color:#DDD5BF; }
        .trail-card-body{ padding:18px; display:flex; flex-direction:column; gap:6px; }
        .trail-card-title{ font-family:'Big Shoulders Display',sans-serif; text-transform:none; font-size:19px; font-weight:700; margin:0; }
        .trail-meta{ display:flex; align-items:center; gap:6px; font-family:'JetBrains Mono',monospace; font-size:11.5px; color:var(--pine); font-weight:600; }
        .trail-meta-sm{ font-size:10.5px; margin-top:2px; }
        .trail-dot{ color:var(--granite); }

        .vendor-grid{ display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
        @media (max-width:900px){ .vendor-grid{ grid-template-columns:1fr 1fr; } }
        @media (max-width:620px){ .vendor-grid{ grid-template-columns:1fr; } }
        .vendor-card{ background:var(--paper); border:1px solid #DDD5BF; border-top:3px solid var(--ember); border-radius:6px; overflow:hidden; display:flex; flex-direction:column; }
        .vendor-card-photo{ height:120px; background-color:#DDD5BF; }
        .vendor-card-body{ padding:18px; display:flex; flex-direction:column; gap:6px; }
        .vendor-card-top{ display:flex; align-items:center; gap:8px; }
        .vendor-card-bottom{ display:flex; flex-direction:column; align-items:flex-start; gap:8px; margin-top:10px; }
        .click-badge{ display:flex; align-items:center; gap:5px; font-family:'JetBrains Mono',monospace; font-size:11px; color:var(--granite); }

        .explore-head-row{ display:flex; justify-content:space-between; align-items:flex-end; gap:16px; flex-wrap:wrap; }
        .add-trail-panel{ display:flex; flex-direction:column; gap:14px; background:var(--paper-2); border-radius:6px; padding:20px; margin-top:16px; }
        .add-trail-panel .field-row{ flex-wrap:wrap; }
        .add-trail-panel .field{ min-width:160px; }
        .trail-card-head{ display:flex; justify-content:space-between; align-items:flex-start; }
        .trail-delete{ background:none; border:none; color:var(--granite); padding:2px; }
        .trail-delete:hover{ color:var(--ember); }

        /* location control + distances */
        .location-control{ background:var(--paper-2); border-radius:6px; padding:14px 16px; }
        .location-control-row{ display:flex; align-items:center; gap:8px; }
        .location-control-text{ display:flex; align-items:center; gap:10px; font-size:13.5px; flex-wrap:wrap; }
        .location-set{ font-weight:600; color:var(--pine); }
        .location-control-actions{ display:flex; gap:10px; margin-top:10px; flex-wrap:wrap; }
        .location-control-actions select{ font-family:inherit; padding:9px 10px; border-radius:4px; border:1.5px solid #DDD5BF; background:var(--paper); font-size:13px; }
        .distance-badge{ display:inline-flex; align-items:center; gap:3px; font-family:'JetBrains Mono',monospace; font-size:10.5px; color:var(--ember); font-weight:600; }

        /* toggle switch */
        .toggle-row{ display:flex; align-items:center; gap:10px; background:none; border:none; padding:0; font-weight:700; font-size:13.5px; }
        .toggle-row span{ display:flex; align-items:center; gap:6px; }
        .toggle-switch{ width:36px; height:20px; border-radius:20px; background:#DDD5BF; position:relative; flex-shrink:0; transition:background .15s; }
        .toggle-switch-on{ background:var(--pine); }
        .toggle-knob{ position:absolute; top:2px; left:2px; width:16px; height:16px; border-radius:50%; background:#fff; transition:transform .15s; }
        .toggle-switch-on .toggle-knob{ transform:translateX(16px); }

        /* lodging */
        .lodging-grid{ display:grid; grid-template-columns:repeat(2,1fr); gap:14px; margin-top:12px; }
        @media (max-width:700px){ .lodging-grid{ grid-template-columns:1fr; } }
        .lodging-card{ background:var(--paper); border:1px solid #DDD5BF; border-radius:6px; padding:16px; display:flex; flex-direction:column; gap:6px; }

        .itin-item-reserve{ margin-top:4px; }
        .share-panel{ margin-top:28px; }
        .share-panel-top{ margin-top:16px; border:1.5px solid var(--pine); }
        .share-actions{ display:flex; gap:10px; flex-wrap:wrap; }

        @media print {
          .nav, .footer, .page-hero, .trip-controls, .day-tabs, .activity-grid, .share-panel, .control-label + .activity-grid { display:none !important; }
          .trip-layout{ display:block !important; }
          body, .site{ background:#fff !important; }
        }

        /* footer */
        .footer{ background:var(--pine); color:var(--paper-2); padding-top:8px; }
        .footer-inner{ max-width:1180px; margin:0 auto; padding:36px 24px; display:grid; grid-template-columns:1.4fr 1fr; gap:30px; }
        @media (max-width:760px){ .footer-inner{ grid-template-columns:1fr; } }
        .footer-note{ font-size:13.5px; color:#B9C4BC; margin-top:12px; max-width:280px; line-height:1.5; }
        .footer-head{ font-family:'JetBrains Mono',monospace; font-size:11px; letter-spacing:0.1em; text-transform:uppercase; color:var(--gold); margin-bottom:12px; }
        .footer-line{ display:flex; align-items:center; gap:8px; font-size:13.5px; margin-bottom:8px; color:#D9DFD5; }
        .footer-bottom{ text-align:center; font-size:11.5px; color:#7C8A80; padding:16px; border-top:1px solid #2C4A3B; }
      `}</style>

      <Nav view={view} setView={setView} />
      {view === "home" && <Home setView={setView} />}
      {view === "trip" && <TripBuilder userLocation={userLocation} setUserLocation={setUserLocation} />}
      {view === "explore" && <ExplorePage userLocation={userLocation} setUserLocation={setUserLocation} />}
      <Footer />
    </div>
  );
}
