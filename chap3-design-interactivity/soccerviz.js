// load data function
function createSoccerViz(){
    $(document).ready(function(){
        d3.csv('worldcup.csv').then(data =>
            overallTeamViz(data))
    })
}

function overallTeamViz(incomingData){
    // create a group of teams
    // each team is a smaller group that contains a text and a circle
    d3.select('svg')
        .append('g')
        .attr('id', 'all-teamsG')
        .attr('transform', 'translate(50,250)') // set origin for the big group
        .selectAll('g')
        .data(incomingData)
        .enter()
        .append('g')
        .attr('class','teamG')
        .attr('transform', (d,i) => 'translate(' + (i*80) +', 0)'); // set origin for small group

    var each_teamG = d3.selectAll('g.teamG');

    // discrete color for unique regions
    unique = [...new Set(incomingData.map(item => item.region))];
    var regionColor = d3.scaleOrdinal()
                        .domain(unique)
                        .range(d3.schemeCategory10)
                        .unknown('gray');
    console.log(unique, regionColor('UEFA'))

    each_teamG.append('circle')
        .attr('r', '20') // default size of each team's circle
        .classed('inactive', true)
        .attr('stroke', d=>regionColor(d.region))
        .on('mouseover', hightlightRegion);

    each_teamG.append('text') // label for each circle
        .attr('y', '10')
        .attr('x', '60')
        .text(d => d.team)
        .classed('rotated', true)
        .style('font-size', 'small');

    // when the circles have mouse over
    // the countries in the same region are hightlighted
    // their size increases to fraw attention

    function hightlightRegion(i, d){
        // console.log('selected', d)
        d3.selectAll('g.teamG')
            .select('circle')
            .attr('class', p => p.region === d.region ? 'active' : 'inactive');
            // this is an inline "if": condion ? true : false
        var original_radius = []

        d3.selectAll('circle.active')
            .each(function(d,i){
                console.log(d,i);
                original_radius.push(this.getAttribute('r'));
                d3.select(this.parentElement).raise(); // select parent element to move forward
            })
            .data(original_radius)
            // cannot use .raise() here because it only moves the circle in front of its label
            // have to raise the whole group
            .transition()
            .delay((d,i) => i*100)
            .duration(500)
            .attr('r', d=>d*3)
            .transition()
            .duration(500)
            .attr('r',d=>d);
    }

    //when mouse is out, original color is restored
    each_teamG.on('mouseout', unHighlight);
    function unHighlight(){
        d3.selectAll('g.teamG')
            .select('circle')
            .classed('active', false)
            .classed('inactive', true);
    }

    // select only numerical features
    const relevantKeys = Object.keys(incomingData[0])
        .filter(feature => feature!=='team' && feature!=='region');

    // create a set of buttons that trigger an event when clicked
    d3.select('#controls')
        .selectAll('button.feature')
        .data(relevantKeys)
        .enter()
        .append('button')
        .attr('class', 'feature')
        .on('click', buttonClick) // the function here does not need an argument
        .html(feature_name=>feature_name);

    // when the button is clicked, circles are resized based on feature value
    function buttonClick(d, feature_name){
        // here the auto generated arguments (d, i) are (json object click, value of binded data)
        console.log(feature_name, 'haha', d, feature_name);
        var maxValue = d3.max(incomingData, d =>
            parseFloat(d[feature_name]));
        console.log(maxValue);
        var radiusScale = d3.scaleLinear()
                            .domain([0, Math.sqrt(maxValue)])
                            .range([2,25]);
        var colorRamp = d3.scaleLinear()
                            //.interpolate(d3.interpolateHsl)
                            // HSL is vibrant
                            .interpolate(d3.interpolateHcl)
                            // HCL is pastel
                            //.interpolate(d3.interpolateLab)
                            // LAB is desaturated
                            .domain([0, maxValue])
                            .range(['purple','yellow']);
        d3.selectAll('g.teamG')
            .select('circle')
            .transition().duration(1000)
            .attr('r', d => radiusScale(Math.sqrt(d[feature_name])))
            .style('fill', d=>colorRamp(d[feature_name]));
    }

}
