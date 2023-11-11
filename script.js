let json_data = null;
const paintingsList = [
    "Klee Yellow",
    "Klee Red",
    "Kandinsky Albertina",
    "Kandinsky Pompidou",
    "Mortensen Pink",
    "Mortensen Orange",
    "Miro",
    "Winter"]
const adjectiveToIcon = {
    Positive: "sentiment_very_satisfied",
    Active: "directions_run",
    Still: "free_breakfast",
    Sad: "sentiment_very_dissatisfied",
    Peaceful: "spa",
    Hard: "terrain",
    Cold: "ac_unit",
    Light: "wb_sunny",
    Rough: "change_history",
    Spiritual: "church",
    Feminine: "female",
    Cautious: "security",
    Like: "thumb_up",
    Interesting: "emoji_objects",
};
const artworks = [
    {
        artist: "Paul Klee",
        title: "Zeichen in Gelb / Sign in Yellow",
        year: 1937,
        collection: "Foundation Beyeler, Riehen/Basel"
    },
    {
        artist: "Paul Klee",
        title: "Blick aus Rot / Be aware of Red",
        year: 1937,
        collection: "Zentrum Paul Klee, Bern"
    },
    {
        artist: "Wassily Kandinsky",
        title: "Regungen / Impulses",
        year: 1928,
        collection: "Albertina, Vienna, Permanent loan basis, Collection Forberg",
    },
    {
        artist: "Wassily Kandinsky",
        title: "Untitled",
        year: 1934,
        collection: "Centre Pompidou, Paris"
    },
    {
        artist: "Richard Mortensen",
        title: "Øvelsesstykker / Exercise pieces",
        year: 1922,
        collection: "Private Collection, Sold by Bruun Rasmussen Auctioneers, 6. August 1992, lot 728"
    },
    {
        artist: "Richard Mortensen",
        title: "Øvelsesstykker / Exercise pieces",
        year: 1922,
        color: "Orange",
        collection: "Private Collection, On sale at Bruun Rasmussen Auctioneers, 20. July 1992, lot 729"
    },
    {
        artist: "Joan Mirò",
        title: "Untitled",
        year: 1961,
        collection: "Yvon Taillandier, Pierre Matisse Gallery"
    },
    {
        artist: "Fritz Winter",
        title: "Siebdruck 6 / Silkscreen 6",
        year: 1950,
        collection: "Galleri MDA, Sweden, Helsingborg"
    }
];
const paintingsLength = paintingsList.length;

var currentChartIndex = 0;

var currentViz = "MENU";

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
    renderMenu();

}); // end am4core.ready()

function createChart(paint_selected){
    $("#bgdiv").fadeOut(500, function(){

        $("#chart").empty();
        $("#legend").remove();
        $("#titlediv").remove();
        $("#ul-list").show();
        let bgdiv = document.getElementById('bgdiv');
        bgdiv.style.background = "";
        bgdiv.style.backgroundImage = "url('images/"+(paint_selected+1)+".jpg')";
        $("#bgdiv").append("<div class=\"chart-container legend-div\" id=\"legend\"></div>");

        $("#bgdiv").append("<div class=\"chart-container title-div\" id=\"titlediv\">" +
            "<p>"+artworks[paint_selected].artist+" - "+artworks[paint_selected].title+"</p>" +
            "</div>");

        // Get the element where you want to append the legend
        const legendContainer = $('#legend');

        // Create a Bootstrap row to hold two columns
        var row = $('<div>').addClass('row');

        let columnCounter = 0; // Counter for columns

        // Create a header for the legend
        const legendHeader = $('<h3>').text('Emotion Icon Legend');
        legendContainer.append(legendHeader);

        // Insert a horizontal bar (hr) between the title and the legend
        const horizontalBar = $('<hr>');
        legendContainer.append(horizontalBar);

        // Loop through the dictionary and create legend items
        for (const adjective in adjectiveToIcon) {
            const icon = adjectiveToIcon[adjective];
            const legendItem = $('<div>').addClass('legend-item');
            const iconElement = $('<i>').addClass('material-icons align-middle').text(icon);
            const textElement = $('<span>').text(adjective);

            // Append the icon and text to the legend item
            legendItem.append(iconElement, " - " ,textElement);

            // Create a Bootstrap column and append the legend item
            const column = $('<div>').addClass('col-md-6');
            column.append(legendItem);

            // Append the column to the row
            row.append(column);

            // Check if it's time to start a new row
            columnCounter++;
            if (columnCounter === 2) {
                // Append the row to the legend container and start a new row
                legendContainer.append(row);
                row = $('<div>').addClass('row');
                columnCounter = 0;
            }
        }

        // Append any remaining items in the last row
        if (columnCounter > 0) {
            legendContainer.append(row);
        }

    });

    $("#bgdiv").fadeIn(500, function() {
        var chart = am4core.create("chart", am4plugins_forceDirected.ForceDirectedTree);

        // Rest of your chart configuration
        var networkSeries = chart.series.push(new am4plugins_forceDirected.ForceDirectedSeries())

        let paint_obj = [{
            name: paintingsList[paint_selected],
            children: structuredClone(json_data[paintingsList[paint_selected]]),
        }]

        // Define the new min and max values for scaling (20-40)
        const newMinValue = 30;
        const newMaxValue = 50;

        // Normalize to the 20-40 scale and find the new min and max values
        const { min, max } = minMaxNormalizeToRange(paint_obj, newMinValue, newMaxValue);

        console.log("Normalized data:", paint_obj);

        chart.data = paint_obj;

        networkSeries.dataFields.value = "value";
        networkSeries.dataFields.oldValue = "oldValue";
        networkSeries.dataFields.name = "name";
        networkSeries.dataFields.icon = "icon"
        networkSeries.dataFields.children = "children";
        networkSeries.nodes.template.tooltipText = "{name}";
        networkSeries.nodes.template.fillOpacity = 1;

        //networkSeries.nodes.template.label.text = "{name}"

        networkSeries.nodes.template.label.html = "<i class=\"material-icons align-middle\" style=\"font-size: 1.5em;\">{icon}</i>";
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

        networkSeries.nodes.template.adapter.add("fill", function(fill, target) {
            var node = target
            if (node.dataItem.level === 2) {
                var value = node.dataItem.dataContext.value;
                value = ((value - min) / (max-min))
                return fill.lighten((1 - value));
            }
            return fill.lighten(0)
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

        networkSeries.links.template.strokeWidth = 5;
        networkSeries.links.template.strokeOpacity = 1;

    });
}

function createHeat(paint_selected){

    $("#bgdiv").fadeOut(500, function(){

        $("#chart").empty();
        $("#legend").remove();
        $("#titlediv").remove();
        $("#ul-list").show();
        $("#chart").append("<div class=\"chart-container title-div\" id=\"titlediv\">" +
            "<p>"+artworks[paint_selected].artist+" - "+artworks[paint_selected].title+"</p>" +
            "</div>");
        $("#chart").append("<div class=\"chart-container content-div\" id=\"heatdiv\"></div>");
        let bgdiv = document.getElementById('bgdiv');
        bgdiv.style.background = "";
        bgdiv.style.backgroundImage = "url('images/"+(paint_selected+1)+".jpg')";

        var chart = am4core.create("heatdiv", am4charts.XYChart);
        chart.maskBullets = false;

        var xAxis = chart.xAxes.push(new am4charts.CategoryAxis());
        var yAxis = chart.yAxes.push(new am4charts.CategoryAxis());

        xAxis.dataFields.category = "emotion1";
        yAxis.dataFields.category = "emotion2";

        xAxis.renderer.grid.template.disabled = true;
        xAxis.renderer.minGridDistance = 40;

        yAxis.renderer.grid.template.disabled = true;
        yAxis.renderer.inversed = true;
        yAxis.renderer.minGridDistance = 30;

        var series = chart.series.push(new am4charts.ColumnSeries());
        series.dataFields.categoryX = "emotion1";
        series.dataFields.categoryY = "emotion2";
        series.dataFields.value = "value";
        series.sequencedInterpolation = true;
        series.defaultState.transitionDuration = 3000;

        var columnTemplate = series.columns.template;
        columnTemplate.strokeWidth = 2;
        columnTemplate.strokeOpacity = 1;
        columnTemplate.stroke = am4core.color("#ffffff");
        columnTemplate.tooltipText = " {emotion1}, {emotion2}: {value}";
        columnTemplate.width = am4core.percent(100);
        columnTemplate.height = am4core.percent(100);

        series.heatRules.push({
            target: columnTemplate,
            property: "fill",
            min: am4core.color("#ffffff"),
            max: am4core.color("#692155")
        });

        // heat legend
        var heatLegend = chart.bottomAxesContainer.createChild(am4charts.HeatLegend);
        heatLegend.width = am4core.percent(100);
        heatLegend.series = series;
        heatLegend.valueAxis.renderer.labels.template.fontSize = 9;
        heatLegend.valueAxis.renderer.minGridDistance = 30;

        // heat legend behavior
        series.columns.template.events.on("over", (event) => {
            handleHover(event.target);
        })

        series.columns.template.events.on("hit", (event) => {
            handleHover(event.target);
        })

        function handleHover(column) {
            if (!isNaN(column.dataItem.value)) {
                heatLegend.valueAxis.showTooltipAt(column.dataItem.value)
            } else {
                heatLegend.valueAxis.hideTooltip();
            }
        }

        series.columns.template.events.on("out", (event) => {
            heatLegend.valueAxis.hideTooltip();
        })

        chart.data = convertToEmotionPairs(json_data[paintingsList[paint_selected]]);


    });

    $("#bgdiv").fadeIn(500);

}

function createChordDiagram(paint_selected){
    $("#bgdiv").fadeOut(500, function(){

        $("#chart").empty();
        $("#legend").remove();
        $("#titlediv").remove();
        $("#ul-list").show();
        $("#chart").append("<div class=\"chart-container title-div\" id=\"titlediv\">" +
            "<p>"+artworks[paint_selected].artist+" - "+artworks[paint_selected].title+"</p>" +
            "</div>");
        $("#chart").append("<div class=\"chart-container content-div\" id=\"chord-div\"></div>");
        let bgdiv = document.getElementById('bgdiv');
        bgdiv.style.background = "";
        bgdiv.style.backgroundImage = "url('images/"+(paint_selected+1)+".jpg')";
        var chart = am4core.create("chord-div", am4charts.ChordDiagram);

        // Define the new min and max values for scaling (20-40)
        const newMinValue = 0;
        const newMaxValue = 100;

        var chords = [{
            name: paintingsList[paint_selected],
            children: structuredClone(json_data[paintingsList[paint_selected]]),
        }]

        // Normalize to the 20-40 scale and find the new min and max values
        const { min, max } = minMaxNormalizeToRange(chords, newMinValue, newMaxValue);

        console.log(chords)

        chords =  convertToChordPairs(chords[0].children)

        console.log(chords)

        chart.data = chords

        chart.dataFields.fromName = "from";
        chart.dataFields.toName = "to";
        chart.dataFields.value = "value";
        chart.dataFields.oldValue = "oldValue";

        // Control width of the node
        chart.innerRadius = -20;

        // Configure ribbon appearance
        var slice = chart.nodes.template.slice;
        slice.stroke = am4core.color("#000");
        slice.strokeOpacity = 0.5;
        slice.strokeWidth = 1;
        slice.cornerRadius = 8;
        slice.innerCornerRadius = 0;

        // Configure labels
        var label = chart.nodes.template.label;
        label.fontSize = 20;
        label.fill = am4core.color("#555");

        // Configure links
        var link = chart.links.template;
        link.colorMode = "gradient";
        link.fillOpacity = 0.7;

        link.tooltipText = "{fromName}-{toName}: {oldValue}"


    });

    $("#bgdiv").fadeIn(500);
}

function createAbout(paint_selected){
    $("#bgdiv").fadeOut(500, function(){

        $("#chart").empty();
        $("#legend").remove();
        $("#titlediv").remove();
        $("#ul-list").show();
        $("#chart").append("<div class=\"chart-container content-div\" id=\"infodiv\"></div>");
        let bgdiv = document.getElementById('bgdiv');
        bgdiv.style.background = "";
        bgdiv.style.backgroundImage = "url('images/"+(paint_selected+1)+".jpg')";
        $("#infodiv").append("<div class=\"row container\" style=\"clear:both;\">\n" +
            "                <div class=\"artist-info col-lg-4 container\" id=\"div-img\">\n" +
            "                   <figure class=\"figure painting-container img-container\">" +
            "                   <img src=\"images/"+(paint_selected+1)+".jpg\" class=\"figure-img img-fluid rounded\">" +
            "                   </figure>" +
            "                </div>" +
            "                <div class=\"artist-info col-lg-8 art-desc-div\">\n" +
            "                    <p class=\"art-desc\">" +
            "                    <b>Title</b>: "+artworks[paint_selected].title+"<br>"+
            "                    <b>Artist</b>: "+artworks[paint_selected].artist+"<br>"+
            "                    <b>Year</b>: "+artworks[paint_selected].year+"<br>"+
            "                    <b>Collection</b>: "+artworks[paint_selected].collection+"<br>"+
            "                    </p>"+
            "                </div>"+
            "                </div>"
        );
    });

    $("#bgdiv").fadeIn(500);
}

function createMenu(){
    $("#bgdiv").fadeOut(500, function(){

        $("#chart").empty();
        $("#legend").remove();
        $("#titlediv").remove();
        $("#ul-list").hide();
        $("#chart").append("<div class=\"chart-container content-div menu\" id=\"menudiv\"></div>");
        $("#menudiv").append("<div class=\"menu-header\">\n" +
            "            <h1>Aesthetic Experience</h1>\n" +
            "            <p>by Paolo Speziali</p>\n" +
            "        </div>\n" +
            "        <div class=\"menu-grid\" id=\"menu-grid\">\n" +
            "            <!-- Menu items will be generated dynamically with jQuery -->\n" +
            "        </div>")
        let bgdiv = document.getElementById('bgdiv');
        bgdiv.style.background = "linear-gradient(to bottom, #333, #666)";

        let i = 0;
        const menuGrid = $('#menu-grid');

        artworks.forEach(function(artwork) {
            i++
            const menuItem = $('<div>').addClass('menu-item bg-image').attr('index', i-1);
            const link = $('<a>').attr('href', artwork.link);
            const image = $('<img>').attr('src', 'images/'+i+'.jpg').attr('alt', artwork.title);
            const title = $('<h2>').text(artwork.title);
            const artist = $('<p>').text(artwork.artist);

            menuItem.on('click', function() {
                currentChartIndex = parseInt($(this).attr('index'));
                console.log(currentChartIndex)
                renderCurrentChart();
            });

            link.append(image, title, artist);
            menuItem.append(link);
            menuGrid.append(menuItem);
        });

    });

    $("#bgdiv").fadeIn(500);
}


const prevButton = document.getElementById('prev-chart');
const nextButton = document.getElementById('next-chart');

function renderCurrentChart() {
    // Create and render the amChart based on chartData
    $("#prev-chart").show();
    $("#next-chart").show();
    currentViz = "FORCE";
    createChart(currentChartIndex); // Replace with your amChart creation logic
}

function renderCurrentHeatMap() {
    // Create and render the amChart based on chartData
    $("#prev-chart").show();
    $("#next-chart").show();
    currentViz = "HEAT";
    createHeat(currentChartIndex); // Replace with your amChart creation logic
}

function renderChordDiagram() {
    // Create and render the amChart based on chartData
    $("#prev-chart").show();
    $("#next-chart").show();
    currentViz = "CHORD";
    createChordDiagram(currentChartIndex); // Replace with your amChart creation logic
}

function renderAbout() {
    // Create and render the amChart based on chartData
    $("#prev-chart").show();
    $("#next-chart").show();
    currentViz = "ABOUT";
    createAbout(currentChartIndex); // Replace with your amChart creation logic
}

function renderMenu() {
    $("#prev-chart").hide();
    $("#next-chart").hide();
    currentViz = "MENU";
    createMenu();
}

prevButton.addEventListener('click', () => {
    currentChartIndex = (currentChartIndex - 1 + paintingsLength) % paintingsLength;
    chooseNextChart();
});

nextButton.addEventListener('click', () => {
    currentChartIndex = (currentChartIndex + 1) % paintingsLength;
    chooseNextChart();
});

function chooseNextChart(){
    switch (currentViz){
        case "FORCE":
            renderCurrentChart();
            break;
        case "HEAT":
            renderCurrentHeatMap();
            break;
        case "CHORD":
            renderChordDiagram();
            break;
        case "ABOUT":
            renderAbout();
            break;
        case "MENU":
            renderMenu();
            break;
    }
}


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

function convertToEmotionPairs(data) {
    const result = [];

    for (let i = 1; i < data.length; i++) {
        const emotion1 = data[i].name;
        const children = data[i].children;

        for (let j = 0; j < children.length; j++) {
            const emotion2 = children[j].name;
            const value = children[j].value;
            if(emotion2 !== "Active"){
                result.push({ emotion1, emotion2, value });
            }
        }
    }

    return result;
}

function convertToChordPairs(data) {
    const result = [];

    for (let i = 0; i < data.length; i++) {
        const emotion1 = data[i].name;
        const children = data[i].children;

        for (let j = 0; j < children.length; j++) {
            const emotion2 = children[j].name;
            const value = children[j].value;
            const oldValue = children[j].oldValue;
            console.log(result.filter(e => e.from === emotion2 && e.to === emotion1).length )
            if(result.filter(e => e.from === emotion2 && e.to === emotion1).length === 0) {
                result.push({from: emotion1, to: emotion2, value: value, oldValue: oldValue });
            }
        }
    }

    return result;
}

$(document).ready(function () {

    currentChartIndex = 0;

    // Select the button element by its ID and attach a click event handler
    $("#fdg").click(function () {
        renderCurrentChart();
    });

    $("#heat").click(function () {
        renderCurrentHeatMap();
    });

    $("#chord").click(function () {
        renderChordDiagram();
    });

    $("#about").click(function () {
        renderAbout();
    });

    $("#menu").click(function () {
        renderMenu();
    });
});