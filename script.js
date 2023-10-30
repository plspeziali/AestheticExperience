let json_data = null;
const paintingsList = ["Klee Yellow", "Klee Red",
                                "Kandinsky Albertina", "Kandinsky Pompidou",
                                "Mortensen Pink", "Mortensen Orange",
                                "Miro", "Winter"]
const paintingsLength = paintingsList.length;

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
            children: json_data[paintingsList[paint_selected]]
        }]

        function minMaxNormalizeToRange(data, newMin, newMax) {
            let minValue = Number.POSITIVE_INFINITY;
            let maxValue = Number.NEGATIVE_INFINITY;

            // Recursive function to traverse the JSON data structure
            function traverse(obj) {
                for (const obj of data) {
                    console.log(obj)
                    for (const emo of obj.children) {
                        console.log(emo)
                        for (const emo2 of emo.children) {
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
                console.log(obj)
                for (const emo of obj.children) {
                    console.log(emo)
                    for (const emo2 of emo.children) {
                        console.log(emo2)
                        if (typeof emo2.value === 'number') {
                            emo2.oldValue = emo2.value
                            emo2.value = (emo2.value - minValue) / range * (newMax - newMin) + newMin;
                        }
                    }
                }
            }

            return { min: newMin, max: newMax };
        }

        // Define the new min and max values for scaling (20-40)
        const newMinValue = 10;
        const newMaxValue = 50;

        // Normalize to the 20-40 scale and find the new min and max values
        const { min, max } = minMaxNormalizeToRange(paint_obj, newMinValue, newMaxValue);

        console.log("Normalized data:", paint_obj);

        chart.data = paint_obj;

        networkSeries.dataFields.value = "value";
        networkSeries.dataFields.name = "name";
        networkSeries.dataFields.children = "children";
        networkSeries.nodes.template.tooltipText = "{name}";
        networkSeries.nodes.template.fillOpacity = 1;
        networkSeries.nodes.template.label.text = "{name}";
        networkSeries.fontSize = 10;
        networkSeries.centerStrength = 0.5;

        // Define node template
        var nodeTemplate = networkSeries.nodes.template;
        nodeTemplate.propertyFields.value = "value"; // Set node radius based on 'value' property
        nodeTemplate.radius = 20; // Default node radius
        nodeTemplate.fillOpacity = 0.7;

// Create the label
        var label = nodeTemplate.createChild(am4core.Label);
        label.text = "{oldValue}";
        label.fill = am4core.color("#FFFFFF"); // White text color
        label.fontSize = 12;
        label.dy = -10; // Adjust the label's vertical position
        nodeTemplate.events.on("ready", function (event) {
            label.hide();
        });

        // Define links between nodes if necessary
        networkSeries.links.template.distance = 1;

        // Enable drag and zoom interaction
        chart.zoomable = true;
        chart.seriesContainer.draggable = true;

        // Add a click event to show/hide the label
        nodeTemplate.events.on("hit", function (event) {
            var clickedNode = event.target;
            if (label.isHiding || label.isHidden) {
                label.show();
            } else {
                label.hide();
            }
        });

        // Create a black outline for the label
        label.outline = true;
        label.outlineWidth = 2;
        label.outlineColor = am4core.color("#000");

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
