d3.csv("players.csv").then(RawData =>
    {
    RawData.forEach(function(data){
        data.AB = Number(data.AB);
        data.H = Number(data.H);
        data.salary = Number(data.salary);
        data.SO = Number(data.SO);
    })
    console.log("RawData", RawData);
    let NewData = RawData.filter(data=>data.AB>25);

    NewData = NewData.map(data=>
    {
        return{
            "name":data.nameFirst+" "+data.nameLast,
            "H_AB":data.H/data.AB,
            "SO_AB":data.SO/data.AB,
            "salary":data.salary,
            "teamID":data.teamID
        };
    });
    console.log("NewData", NewData);
    
    let num_player = {};
    let nf;
    let disf;
    let brshxd;
    var a = d3.nest()
          .key(function(d){return d.teamID;})
          .rollup(function(d){return d.length;})
          .entries(NewData);


    let team = NewData.map(data=>
    {
        return[data.teamID];
    });

    for(var i = 0; i < team.length; i++)
    {
        var num = team[i];
        if (num_player[num])
        {
            num_player[num]++;
        }
        else
        {
            num_player[num]=1;
        }
        
    }
    console.log("number of player",num_player);

    let final =[]
    let zf =[];

    for(var i = 0; i < 30; i++)
    {
        final.push({teamID:Object.keys(num_player)[i],number_player:num_player[Object.keys(num_player)[i]]})
    }

    for(var i = 0; i < 30; i++)
    {
        zf.push({key:Object.keys(num_player)[i],value : 0})
    }
    console.log("final",zf);





    const svg = d3.select("#chart-area").append("svg")
        .attr("width", teamWidth + teamMargin.left + teamMargin.right)
        .attr("height", scatterHeight + teamHeight + scatterMargin.top + scatterMargin.bottom + 100)
        

    const scatter = svg.append("g")
        .attr("width" , scatterWidth)
        .attr("height", scatterHeight)
        .attr("transform", `translate(${scatterMargin.left}, ${scatterMargin.top})`)

    const barChart = svg.append("g")
        .attr("width" , teamWidth)
        .attr("height", teamHeight)
        .attr("transform", `translate(${teamMargin.left}, ${teamTop})`)

    const distribution = svg.append("g")
        .attr("width" , distrWidth)
        .attr("height", distrHeight)
        .attr("transform", `translate(${distrLeft}, ${distrMargin.top})`)

//tip
    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .html(NewData=>(NewData.teamID + "<br>" +  NewData.name + "<br>"+ "Salary: " + NewData.salary));
//bursh
    var gender = [0,0];
    var brush = d3.brush()
        .extent([[0, 0], [scatterWidth, scatterHeight]])
        .on("start", brushed)
        .on("brush", brushed)
        .on("end", endbrushed);    
    

    function brushed(){
        var extent = d3.event.selection;
        var brshdata =[];

        circles
            .classed("selected", function(d) { 
                select = scatterx(d.H_AB) >= extent[0][0] &&
                    scatterx(d.H_AB) <= extent[1][0] &&
                    scattery(d.SO_AB) >= extent[0][1] &&
                    scattery(d.SO_AB) <= extent[1][1];
                
                if (select) 
                {
                    brshdata.push(d);
                }
                
                return select;
        });
         disf = brshdata;
         nf = d3.nest()
          .key(function(d){return d.teamID;})
          .rollup(function(d){return d.length;})
          .entries(brshdata);
   

    }
    function endbrushed() {
        
        newrects.data(zf)
            
            .attr("y",d=>y(d.value))
            .attr("x",(d)=>x(d.key))
            .attr("width", x.bandwidth)
            .attr("height",d => teamHeight - y(d.value))
            .attr("fill", "LightSteelBlue")

         newrects.data(nf)
            
            .attr("y",d=>y(d.value))
            .attr("x",(d)=>x(d.key))
            .attr("width", x.bandwidth)
            .attr("height",d => teamHeight - y(d.value))
            .attr("fill", "LightSteelBlue")

        var newbins = histogram(disf);
        console.log("nelwaknean",newbins)
        disselect.datum(newbins)
            .transition()
            .duration(1000)
            .attr("fill","black")
            .attr("stroke", "steelblack")
            .attr("stroke-width", 1.5)
            .attr("d",d3.area().curve(d3.curveMonotoneX)
                .x(function(d){return distrx(d.x0)})
                .y0(distrHeight)
                .y1(function(d){return distry(d.length)})
        )
    }
    
 
    
// Distribution plot
//x 
    distribution.append("text")
        .attr("x",(distrWidth/2))
        .attr("y",(distrHeight+40))
        .attr("font-size", "30px")
        .attr("text-anchor", "middle")
        .text("salary")
//Y
    distribution.append("text")
        .attr("x", -(distrHeight/2))
        .attr("y",-35)
        .attr("font-size", "30px")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .text("Number of players")
    //x
    let distrx = d3.scaleLinear()
        .domain([0, 35000000])
        .range([0, distrWidth]);
    var xAxis = d3.axisBottom(distrx)
    distribution.append("g")
        .attr("transform", "translate(0," + distrHeight + ")")
        //.call(d3.axisBottom(distrx).ticks(5));
        .call(xAxis);
        
    var histogram = d3.histogram()
        .value(function(d){ return d.salary; })
        .domain(distrx.domain())
        .thresholds(distrx.ticks(25));

    //y
    var distry = d3.scaleLinear()
        .domain([0, 190])
        .range([ distrHeight, 0]);
    distribution.append("g")
        .attr("transform", "translate(0," + 0 + ")")
        .call(d3.axisLeft(distry));

    
    var bins = histogram(NewData);
    


    let disdata = bins.map(data=>{
        return{xpoint: data.x0, ypoint: data.length}
    });
    


    diso = distribution.append('g').append("path")
        .datum(bins)
        .attr("fill","#87cefa")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d",d3.area().curve(d3.curveMonotoneX)
            .x(function(d){return distrx(d.x0)})
            .y0(distrHeight)
            .y1(function(d){return distry(d.length)})
        )
    var disselect = distribution.append('g').append("path")
        .datum(bins)
        .attr("fill","#87cefa")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d",d3.area().curve(d3.curveMonotoneX)
            .x(function(d){return distrx(d.x0)})
            .y0(distrHeight)
            .y1(function(d){return distry(d.length)})
        )


    let brushLayer = scatter.append("g")
        .attr("class", "brush")  
        .call(d3.brushX()
                .extent([[490,0],[900,distrHeight]])
                .on("start",brushedx)
                .on("brush", brushedx)
                .on("end", endxbrushed)

                );



    function brushedx(){
        var extent = d3.event.selection;
        
        console.log(extent[0])
        //console.log(extent[1])
        
        circles
            .classed("selectedx", function(d) { 
                //selectx;
                //console.log("d",d)
                selectx = (extent[0]-490)*85365.8537 <= d.salary &&
                           d.salary <= (extent[1]-490)*85365.8537;
                
                
                return selectx;
        });

      

    }
    function endxbrushed(){

    }

   



      
//scatter plot
//x 
    scatter.append("text")
        .attr("x",(scatterWidth/2))
        .attr("y",(scatterHeight+40))
        .attr("font-size", "30px")
        .attr("text-anchor", "middle")
        .text("H/AB")

//Y 
    scatter.append("text")
        .attr("x", -(scatterHeight/2))
        .attr("y",-40)
        .attr("font-size", "30px")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .text("SO/AB")


    const scatterx = d3.scaleLinear()
        .domain([0, 0.35])
        .range([0, scatterWidth])
    scatter.append("g")
        .attr("transform", "translate(0," + scatterHeight + ")")
        .call(d3.axisBottom(scatterx));

    var scattery = d3.scaleLinear()
        .domain([0, 0.75])
        .range([ scatterHeight, 0]);
    scatter.append("g")
        .call(d3.axisLeft(scattery));

    var brushcircle = scatter.append('g');

    var circleG = scatter.append('g');
    var circles = circleG.selectAll("circle")
        .data(NewData)
        .enter()
        .append("circle")
          .attr("cx", function (d) { return scatterx(d.H_AB); } )
          .attr("cy", function (d) { return scattery(d.SO_AB); } )
          .attr("r", 1.5)
          .attr("fill", "#69b3a2")

    circles.on('mouseover',tip.show)
            .on('mouseout',tip.hide);
    
    circleG.call(tip);
    brushcircle.call(brush);
    
    

            
//bar chart
//X 
    barChart.append("text")
        .attr("x", (teamWidth/2))
        .attr("y", teamHeight+40)
        .attr("font-size", "30px")
        .attr("text-anchor", "middle")
        .text("team")

// Y 
    barChart.append("text")
        .attr("x", -(teamHeight / 2))
        .attr("y", -40)
        .attr("font-size", "30px")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .text("Number of players")

// X 
    const x = d3.scaleBand()
        .domain(final.map(data=>data.teamID))
        .range([0, teamWidth])
        .paddingInner(0.2)
        .paddingOuter(0.3)

    const xAxisCall = d3.axisBottom(x)
    barChart.append("g")
        .attr("transform", `translate(0, ${teamHeight})`)
        .call(xAxisCall)
        .selectAll("text")
            .attr("y", "10")
            .attr("x", "-5")

// Y 
    const y = d3.scaleLinear()
        .domain([0, d3.max(final, d => d.number_player)])
        .range([teamHeight, 0])
    
    const yAxiasCall = d3.axisLeft(y)
    barChart.append("g").call(yAxiasCall)

    console.log("sdsd",a);

    var newrects = barChart.selectAll("react").data(zf)
        .enter().append("rect")
        .attr("y",d=>y(d.value))
        .attr("x",(d)=>x(d.key))
        .attr("width", x.bandwidth)
        .attr("height",d => teamHeight - y(d.value))
        .attr("fill", "LightSteelBlue")

    const rects = barChart.selectAll("react").data(a)
        .enter().append("rect")
        .attr("y",d=>y(d.value))
        .attr("x",(d)=>x(d.key))
        .attr("width", x.bandwidth)
        .attr("height",d => teamHeight - y(d.value))
        .attr("stroke" , "black")
        .attr("fill", "none")
    
        
    
}).catch(function(error){
    console.log(error);
});



let abFilter = 25

let scatterLeft = 0, scatterTop = 0;
let scatterMargin = {top: 10, right: 30, bottom: 30, left: 60},
    scatterWidth = 500 - scatterMargin.left - scatterMargin.right,
    scatterHeight = 500 - scatterMargin.top - scatterMargin.bottom;

let distrLeft = 550, distrTop = 0;
let distrMargin = {top: 10, right: 30, bottom: 30, left: 60},
    distrWidth = 500 - distrMargin.left - distrMargin.right,
    distrHeight = 500 - distrMargin.top - distrMargin.bottom;

let teamLeft = 0, teamTop = 520;
let teamMargin = {top: 10, right: 30, bottom: 30, left: 60},
    teamWidth = 1000 - teamMargin.left - teamMargin.right,
    teamHeight = 200 - teamMargin.top - teamMargin.bottom;
