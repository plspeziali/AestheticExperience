let json_data = null;
const paintingsList = ["Klee Yellow", "Klee Red",
                                "Kandinsky Albertina", "Kandinsky Pompidou",
                                "Mortensen Pink", "Mortensen Orange",
                                "Miro", "Winter"]
const adjectiveToIcon = {
    Positive: "sentiment_very_satisfied",
    Active: "directions_run",
    Still: "free_breakfast",
    Sad: "sentiment_very_dissatisfied",
    Peaceful: "spa",
    Hard: "accessibility",
    Cold: "ac_unit",
    Light: "wb_sunny",
    Rough: "terrain",
    Spiritual: "brightness_2",
    Feminine: "pregnant_woman",
    Cautious: "security",
    Like: "thumb_up",
    Interesting: "emoji_objects",
};
const paintingsLength = paintingsList.length;

// JavaScript to inhibit scrolling down and disable the right scrollbar
window.addEventListener('scroll', function(e) {
    window.scrollTo(0, 0); // Disable vertical scrolling
    e.preventDefault(); // Prevent default scrolling behavior
});

am4core.ready(function() {

    // Specify the URL of the JSON file you want to load
    const jsonFileURL = 'dataset/all_networks.json';

    // Create a new XMLHttpRequest object
    const xhr = new XMLHttpRequest();

    // Open the request synchronously (third parameter set to false)
    xhr.open('GET', jsonFileURL, false);

    // Send the request
    xhr.send();

    // Check the status and response
    if (xhr.status === 200) {
        // The request was successful, and the JSON data can be accessed in xhr.responseText
        json_data = JSON.parse(xhr.responseText);
    } else {
        console.error('There was an error with the XMLHttpRequest.');
    }


// Themes begin
    am4core.useTheme(am4themes_animated);
// Themes end
    //createChart(0)

}); // end am4core.ready()

function createChart(paint_selected){
    $("#bgdiv").fadeOut(500, function(){

        $("#chart").empty();
        let bgdiv = document.getElementById('bgdiv');
        bgdiv.style.backgroundImage = "url('images/"+(paint_selected+1)+".jpg')";
    });

    $("#bgdiv").fadeIn(500, function() {
        var chart = am4core.create("chart", am4plugins_forceDirected.ForceDirectedTree);
        // Rest of your chart configuration
        var networkSeries = chart.series.push(new am4plugins_forceDirected.ForceDirectedSeries())

        let paint_obj = [{
            name: paintingsList[paint_selected],
            children: json_data[paintingsList[paint_selected]],
        }]

        // Define the new min and max values for scaling (20-40)
        const newMinValue = 30;
        const newMaxValue = 50;

        // Normalize to the 20-40 scale and find the new min and max values
        const { min, max } = minMaxNormalizeToRange(paint_obj, newMinValue, newMaxValue);

        console.log("Normalized data:", paint_obj);

        chart.data = paint_obj;

        networkSeries.dataFields.value = "value";
        networkSeries.dataFields.name = "name";
        networkSeries.dataFields.icon = "icon"
        networkSeries.dataFields.children = "children";
        networkSeries.nodes.template.tooltipText = "{name}";
        networkSeries.nodes.template.fillOpacity = 1;

        //networkSeries.nodes.template.label.text = "{name}"

        networkSeries.nodes.template.label.html = "<i class=\"material-icons\" style=\"font-size: 1.5em;\">{icon}</i>";
        // Modify the node template for nodes at depth 1
        networkSeries.nodes.template.label.adapter.add("html", function(text, target) {
            if (target.dataItem) {
                switch(target.dataItem.level) {
                    case 0:
                        return "<h5>{name}</h5>";
                }
            }
            return text;
        });


        networkSeries.nodes.template.label.adapter.add("fill", function(fill, target) {
            if (target.dataItem.level > 1) {
                return am4core.color("#000");
            }
            return fill;
        })

        networkSeries.nodes.template.adapter.add("tooltipText", function (text, target) {
            var node = target;
            if (node.dataItem.level === 2) {
                // Customize the tooltip text for nodes at the third depth
                return "{name}: {oldValue}";
            }
            return text;
        });

        networkSeries.nodes.template.label.adapter.add("fontSize", function(fontSize, target) {
            var node = target;
            if (node.dataItem.level === 2) {
                return 12; // Customize the font size for nodes at level 2
            }
            return 16; // Keep the default font size for other nodes
        });

        // Customize minRadius for nodes at the first level depth
        networkSeries.nodes.template.paddingRadius = 20
        networkSeries.nodes.template.innerWidth = 60


        networkSeries.fontSize = 10;

        networkSeries.links.template.strokeWidth = 1;

        var hoverState = networkSeries.links.template.states.create("hover");
        hoverState.properties.strokeWidth = 3;
        hoverState.properties.strokeOpacity = 1;

        networkSeries.nodes.template.events.on("over", function(event) {
            event.target.dataItem.childLinks.each(function(link) {
                link.isHover = true;
            })
            if (event.target.dataItem.parentLink) {
                event.target.dataItem.parentLink.isHover = true;
            }

        })

        networkSeries.nodes.template.events.on("out", function(event) {
            event.target.dataItem.childLinks.each(function(link) {
                link.isHover = false;
            })
            if (event.target.dataItem.parentLink) {
                event.target.dataItem.parentLink.isHover = false;
            }
        })


        // Define links between nodes if necessary
        networkSeries.links.template.distance = 1;

        // Start collapsed
        networkSeries.maxLevels = 1;

        // Expand single level only
        networkSeries.nodes.template.expandAll = false;

        // Close other nodes when one is opened
        networkSeries.nodes.template.events.on("hit", function(ev) {
            var targetNode = ev.target;
            if (targetNode.isActive) {
                networkSeries.nodes.each(function(node) {
                    if (targetNode !== node && node.isActive && targetNode.dataItem.level == node.dataItem.level) {
                        node.isActive = false;
                    }
                });
            }
        });
    });
}


let currentChartIndex = 0;

const prevButton = document.getElementById('prev-chart');
const nextButton = document.getElementById('next-chart');

function renderCurrentChart() {
    // Create and render the amChart based on chartData
    createChart(currentChartIndex); // Replace with your amChart creation logic
}

prevButton.addEventListener('click', () => {
    currentChartIndex = (currentChartIndex - 1 + paintingsLength) % paintingsLength;
    renderCurrentChart();
});

nextButton.addEventListener('click', () => {
    currentChartIndex = (currentChartIndex + 1) % paintingsLength;
    renderCurrentChart();
});

// Initial rendering
renderCurrentChart();


function minMaxNormalizeToRange(data, newMin, newMax) {
    let minValue = Number.POSITIVE_INFINITY;
    let maxValue = Number.NEGATIVE_INFINITY;

    // Recursive function to traverse the JSON data structure
    function traverse(obj) {
        for (const obj of data) {
            //console.log(obj)
            for (const emo of obj.children) {
                emo.icon = adjectiveToIcon[emo.name];
                //console.log(emo)
                for (const emo2 of emo.children) {
                    emo2.icon = adjectiveToIcon[emo2.name];
                    if (typeof emo2.value === 'number') {
                        // If the property is a number, update min and max values
                        const value = emo2.value;
                        minValue = Math.min(minValue, value);
                        maxValue = Math.max(maxValue, value);
                    }
                }
            }
        }
    }

    traverse(data);

    // Calculate the range of the original data
    const range = maxValue - minValue;

    // Perform min-max normalization
    for (const obj of data) {
        //console.log(obj)
        for (const emo of obj.children) {
            //console.log(emo)
            for (const emo2 of emo.children) {
                //console.log(emo2)
                if (typeof emo2.value === 'number') {
                    emo2.oldValue = emo2.value
                    emo2.value = (emo2.value - minValue) / range * (newMax - newMin) + newMin;

                }
            }
        }
    }

    return { min: newMin, max: newMax };
}