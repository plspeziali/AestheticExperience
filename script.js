let json_data = null;

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

        chart.data = json_data["Klee Yellow"];
        console.log(json_data)

        networkSeries.dataFields.value = "value";
        networkSeries.dataFields.name = "name";
        networkSeries.dataFields.children = "children";
        networkSeries.nodes.template.tooltipText = "{name}:{value}";
        networkSeries.nodes.template.fillOpacity = 1;

        networkSeries.nodes.template.label.text = "{name}"
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
    });
}

const paintingsLength = 8;
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
