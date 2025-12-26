// Metric display configurations
const metricConfig = {
    population: {
        label: "Population",
        format: (val) => formatLegendNumber(val)
    },
    rewes: {
        label: "Total REWEs",
        format: (val) => val
    },
    rewes_per_10k: {
        label: "REWEs per 10k people",
        format: (val) => val.toFixed(2)
    },
    rewes_per_sq_km: {
        label: "REWEs per km²",
        format: (val) => val.toFixed(2)
    },
    pop_near: {
        label: "Population within 1.3km",
        format: (val) => formatLegendNumber(val)
    },
    percent_near: {
        label: "% within 1.3km",
        format: (val) => (val * 100).toFixed(1) + '%'
    }
};

// Create a shared tooltip for all maps
const tooltip = document.createElement("div");
tooltip.className = "custom-tooltip plot-style-tooltip";
tooltip.style.display = "none";
document.body.appendChild(tooltip);

// Format numbers for legend (k for thousands, m for millions)
function formatLegendNumber(value) {
    if (value >= 1000000) {
        return (value / 1000000).toFixed(1).replace(/\.0$/, '') + 'm';
    } else if (value >= 1000) {
        return (value / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return Math.round(value.toFixed(0));
}

/**
 * Initialize a single map instance
 * @param {HTMLElement} container - The container element with data-source attribute
 * @param {Object} geojson - The GeoJSON data for German Bundesländer
 */
async function initializeMap(container, geojson) {
    // Get configuration from data attributes
    const dataSource = container.getAttribute('data-source');
    const metricsAttr = container.getAttribute('data-metrics');
    const defaultMetric = container.getAttribute('data-default-metric') || 'rewes_per_10k';

    if (!dataSource) {
        console.error('Map container missing data-source attribute', container);
        return;
    }

    // Parse available metrics (comma-separated list)
    const availableMetrics = metricsAttr
        ? metricsAttr.split(',').map(m => m.trim())
        : ['rewes_per_10k', 'rewes', 'population'];

    // Load the data for this map
    const rewesData = await d3.json(dataSource);

    // Clone GeoJSON to avoid sharing state between maps
    const mapGeojson = JSON.parse(JSON.stringify(geojson));

    // Add REWE data to GeoJSON features
    mapGeojson.features.forEach(feature => {
        const name = feature.properties.name;
        const data = rewesData[name] || {};

        // Copy all properties from the data
        Object.keys(data).forEach(key => {
            feature.properties[key] = data[key] || 0;
        });
    });

    // Create map state
    const state = {
        currentMetric: defaultMetric,
        currentHighlight: null,
        currentMap: null,
        geojson: mapGeojson
    };

    // Create wrapper for map and dropdown
    const mapWrapper = document.createElement("div");
    mapWrapper.className = "map-wrapper";
    container.appendChild(mapWrapper);

    // Create dropdown for metric selection
    const dropdown = document.createElement("select");
    dropdown.className = "metric-dropdown";
    availableMetrics.forEach(metric => {
        const option = document.createElement("option");
        option.value = metric;
        option.textContent = metricConfig[metric]?.label || metric;
        if (metric === defaultMetric) {
            option.selected = true;
        }
        dropdown.appendChild(option);
    });
    mapWrapper.appendChild(dropdown);

    // Function to create the map with a specific metric
    function createMap(metric) {
        // Calculate domain for the selected metric
        const values = state.geojson.features.map(f => f.properties[metric]);
        const maxValue = d3.max(values);

        // Get the formatter for this metric
        const metricFormatter = metricConfig[metric]?.format || formatLegendNumber;

        // Create the plot
        const map = Plot.plot({
            projection: {
                type: "mercator",
                domain: state.geojson
            },
            marks: [
                Plot.geo(state.geojson, {
                    fill: d => d.properties[metric],
                    stroke: "white",
                    strokeWidth: 1,
                    channels: {
                        state: d => d.properties.name,
                        value: d => d.properties[metric]
                    }
                })
            ],
            color: {
                range: ["#f5ebe0", "#ce1d23"],
                domain: [0, maxValue],
                legend: true,
                type: "linear",
                tickFormat: metricFormatter
            },
            width: 600,
            height: 600
        });

        // Add event listeners to each path element
        const paths = map.querySelectorAll('path[fill]');

        paths.forEach((path, index) => {
            const feature = state.geojson.features[index];

            path.style.transition = 'all 0.2s ease';

            path.addEventListener('mouseenter', function(event) {
                // Highlight the state
                if (state.currentHighlight) {
                    state.currentHighlight.style.stroke = 'white';
                    state.currentHighlight.style.strokeWidth = '1';
                }
                this.style.stroke = 'orange';
                this.style.strokeWidth = '3';
                state.currentHighlight = this;

                // Show tooltip
                tooltip.style.display = 'block';
                const config = metricConfig[state.currentMetric];
                tooltip.innerHTML = `
                    <div style="font-weight: bold; margin-bottom: 5px;">
                        ${feature.properties.name}
                    </div>
                    <div style="font-size: 12px;">
                        ${config.label}: ${config.format(feature.properties[state.currentMetric])}
                    </div>
                `;
            });

            path.addEventListener('mousemove', function(event) {
                // Update tooltip position to follow cursor
                tooltip.style.left = (event.pageX + 15) + 'px';
                tooltip.style.top = (event.pageY + 15) + 'px';
            });

            path.addEventListener('mouseleave', function() {
                // Remove highlight
                this.style.stroke = 'white';
                this.style.strokeWidth = '1';
                if (state.currentHighlight === this) {
                    state.currentHighlight = null;
                }

                // Hide tooltip
                tooltip.style.display = 'none';
            });
        });

        return map;
    }

    // Initial map render
    state.currentMap = createMap(state.currentMetric);
    mapWrapper.appendChild(state.currentMap);

    // Handle dropdown change
    dropdown.addEventListener('change', function(event) {
        state.currentMetric = event.target.value;
        state.currentHighlight = null;

        // Remove old map
        if (state.currentMap && state.currentMap.parentNode) {
            state.currentMap.remove();
        }

        // Create and add new map
        state.currentMap = createMap(state.currentMetric);
        mapWrapper.appendChild(state.currentMap);
    });
}

/**
 * Initialize all maps on the page
 */
async function initializeMaps() {
    // Load the GeoJSON data once (shared across all maps)
    const geojson = await d3.json("data/4_niedrig.geo.json");

    // Find all map containers with data-source attribute
    const containers = document.querySelectorAll('[data-source]');

    // Initialize each map
    for (const container of containers) {
        await initializeMap(container, geojson);
    }
}

// Run initialization when the script loads
initializeMaps();
