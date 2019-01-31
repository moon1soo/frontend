import { Component, OnInit, Input, EventEmitter, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { AppState } from '../../app.state';
import { PowermodeStoreService } from '../store/store.service';
import { ResultService } from './result.service';

declare var d3: any;
import * as _ from 'lodash';

@Component({
 	selector: 'population-chart',
  	templateUrl: './population.chart.html'
})
export class PopulationChart implements OnInit { 
    @ViewChild("containerPieChart") element: ElementRef;

    htmlElement: HTMLElement;
    patientData: any[] = [];
    ageData: any;
    maxAge = '70';

    isDrawn: boolean = false;
    loading: boolean = true;

	constructor(
        private _service: ResultService
    ) {        
        
    }
    ngOnInit() {
      
        this.htmlElement = this.element.nativeElement;
        this.ageData = this._service.ageStore;

        this._service.ageStoreVo$.subscribe(res => {
            this.ageData = res;
            this.loading = false;
            // if (this.ageData && this.isDrawn === false) {      
            //     console.log('이곳 실행');
            //     this.isDrawn = true;
            //     this.draw();
            // }
            d3.select("#the_SVG_ID").remove();
            this.isDrawn = true;
            this.draw();
        });        

    }    
    draw(): void {        
        // 캔버스 크기
        let canvasWidth = 320,
            canvasHeight = 200;
        // 마진 설정
        let margin = {
            top: 15,
            right: 15,
            bottom: 15,
            left: 15,
            middle: 28
        };
            
        // 차트의 각면의 너비
        let regionWidth = canvasWidth/2 - margin.middle;

        // y축의 x좌표
        let pointA = regionWidth,
            pointB = canvasWidth - regionWidth;

        // -------- 과거버전
        // this.patientData = this.ageData.map(obj => {
        //     let robj = {};
        //     robj['group'] = obj.ageCd !== this.maxAge ? `${obj.ageCd}~${Number(obj.ageCd) + 9}` : `${this.maxAge} 이상`;
        //     robj['male'] = Number(obj.maleCnt);
        //     robj['female'] = Number(obj.femaleCnt);

        //     return robj;
        // });
        // ----------과거버전
        
        let ageData = [];
        for(let key of Object.keys(this.ageData)) {
            ageData.push(this.ageData[key]);
        }
        this.patientData = ageData.map(obj => {
            let robj = {};
            robj['group'] = obj.agecd !== this.maxAge ? `${obj.agecd}~${Number(obj.agecd) + 9}` : `${this.maxAge} 이상`;
            robj['male'] = Number(obj.malecnt);
            robj['female'] = Number(obj.femalecnt);

            return robj;
        });
        // 백분율 전체를 얻고 백분율을 반환하는 함수 만들기
        let totalPopulation = d3.sum(this.patientData, function(d) { 
            return d.male + d.female; 
        }),
        percentage = function(d) { return d / totalPopulation; };

		let tip = d3.tip()
        	.attr('class', 'd3-tip')
        	.offset([-10, 0])
        	.html(function(d) {
        	  return `<span><span class="text-warning">M</span>: ${d.male}, <span class="text-warning">F</span>: ${d.female}</span>`;
        	});		
		
        // CREATE SVG
        let svg = d3.select(this.htmlElement).append('svg')
            .attr("id","the_SVG_ID")
            .attr('width', margin.left + canvasWidth + margin.right)
            .attr('height', margin.top + canvasHeight + margin.bottom)
            .append('g')
            .attr('transform', translation(margin.left, margin.top));
		
		svg.call(tip);

        // 양쪽에서 최대 데이터 값을 찾는다.
        let maxValue = Math.max(
            d3.max(this.patientData, function(d) { return percentage(d.male); }),
            d3.max(this.patientData, function(d) { return percentage(d.female); })
        );

        // SET UP SCALES

        // xScale은 0에서 영역의 너비로 이동. 왼쪽 x 축에 대해 역전.
        let xScale = d3.scale.linear()
            .domain([0, maxValue])
            .range([0, regionWidth])
            .nice();

        let xScaleLeft = d3.scale.linear()
            .domain([0, maxValue])
            .range([regionWidth, 0]);

        let xScaleRight = d3.scale.linear()
            .domain([0, maxValue])
            .range([0, regionWidth]);

        let yScale = d3.scale.ordinal()
            .domain(this.patientData.map(function(d) { return d.group; }))
            .rangeRoundBands([canvasHeight,0], 0.1);


        // SET UP AXES
        let yAxisLeft = d3.svg.axis()
            .scale(yScale)
            .orient('right')
            .tickSize(4,0)
            .tickPadding(margin.middle-4);

        let yAxisRight = d3.svg.axis()
            .scale(yScale)
            .orient('left')
            .tickSize(4,0)
            .tickFormat('');

        let xAxisRight = d3.svg.axis()
            .scale(xScale)
            .orient('bottom')
            .tickFormat(d3.format('%'));

        let xAxisLeft = d3.svg.axis()
        // 범위를 역전시켜 X 축 스케일을 반전.
            .scale(xScale.copy().range([pointA, 0]))
            .orient('bottom')
            .tickFormat(d3.format('%'));

        // 각 측면에 대한 그룹 만들기
        // scale(-1,1) 은 왼쪽을 뒤집어 사용하여 막대가 오른쪽 대신 왼쪽으로 늘어남.
        let leftBarGroup = svg.append('g')
        	.attr('transform', translation(pointA, 0) + 'scale(-1,1)');
        let rightBarGroup = svg.append('g')
			.attr('transform', translation(pointB, 0));

		// d3.select(this.htmlElement)
		// 	.append("div")
		// 	.attr('class','chart-caption')
        // 	.html(`
		// 		  	<span class="mr-2">
		// 				<i class="ico-male"></i> Male
		// 			</span>
		// 			<span>
		// 				<i class="ico-female"></i> Female
		// 			</span>`
		// 		);
        
        // DRAW AXES
        svg.append('g')
            .attr('class', 'axis y left')
            .attr('transform', translation(pointA, 0))
            .call(yAxisLeft)
            .selectAll('text')
            .style('text-anchor', 'middle');

        svg.append('g')
            .attr('class', 'axis y right')
            .attr('transform', translation(pointB, 0))
            .call(yAxisRight);

        // svg.append('g')
        //     .attr('class', 'axis x left')
        //     .attr('transform', translation(0, canvasHeight))
        //     .call(xAxisLeft);

        // svg.append('g')
        //     .attr('class', 'axis x right')
        //     .attr('transform', translation(pointB, canvasHeight))
        //     .call(xAxisRight);

        // DRAW BARS
        leftBarGroup.selectAll('.bar.left')
            .data(this.patientData)
            .enter().append('rect')  
			.attr('class', 'bar left')
			.attr('x', 0)
			.attr('y', function(d) { return yScale(d.group) + 6; })			
			.attr('width', function(d) { return xScale(percentage(d.male)); })
			.attr('height', 12)
			.on('mouseover', tip.show)
			.on('mouseout', tip.hide)
			.transition()
			.duration(500);
            // .attr('height', yScale.rangeBand());            	

        rightBarGroup.selectAll('.bar.right')
            .data(this.patientData)
            .enter().append('rect')
			.attr('class', 'bar right')
			.attr('x', 0)
			.attr('y', function(d) { return yScale(d.group) + 6; })			
			.attr('width', function(d) { return xScale(percentage(d.female)); })
			.attr('height', 12)
			.on('mouseover', tip.show)
			.on('mouseout', tip.hide);
                // .attr('height', yScale.rangeBand());                

        
        function translation(x,y) {
            return 'translate(' + x + ',' + y + ')';
        }
    }
}