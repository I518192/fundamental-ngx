import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChildren,
    Input,
    IterableChangeRecord,
    IterableDiffer,
    IterableDiffers,
    OnChanges,
    OnDestroy,
    OnInit,
    Optional,
    QueryList,
    SimpleChanges,
    TrackByFunction,
    ViewChild,
    ViewContainerRef,
    ViewEncapsulation
} from '@angular/core';
import { Subject } from 'rxjs';

import { TimelineFirstListOutletDirective } from './directives/timeline-first-list-outlet.directive';
import { TimelineNodeDefDirective, TimelineNodeOutletContext } from './directives/timeline-node-def.directive';
import { TimelinePositionControlService } from './services/timeline-position-control.service';
import { GroupByType, GroupedData, TimelineAxis, TimeLinePositionStrategy, TimelineSidePosition } from './types';
import { RtlService } from '@fundamental-ngx/core/utils';
import { TimelineSecondListOutletDirective } from './directives/timeline-second-list-outlet.directive';

@Component({
    selector: 'fd-timeline',
    templateUrl: './timeline.component.html',
    styleUrls: ['./timeline.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [TimelinePositionControlService],
    host: {
        role: 'timeline',
        'arial-label': 'timeline',
        'class': 'fd-timeline',
        '[class.fd-timeline--horizontal]': 'axis === "horizontal"',
        '[class.fd-timeline--vertical]': 'axis === "vertical"',
        '[class.fd-timeline--grouping]': '!!groupByProperty',
    }
})
export class TimelineComponent<T> implements OnInit, OnDestroy, OnChanges, AfterViewInit {


    /**
     * Data array to render
     */
    @Input()
    dataSource: T[] = [];

    /**
     * Tracking function that will be used to check the differences in data changes.
     */
    @Input()
    trackBy: TrackByFunction<T>;

    /**
     * Axis for layout
     */
    @Input()
    axis: TimelineAxis = 'horizontal';

    /**
     * Axis for layout
     */
    @Input()
    layout: TimelineSidePosition = 'double';

    /**
     * Key to group timeline
     */
    @Input()
    groupByProperty: string;

    /**
     * Key to group timeline
     */
    @Input()
    groupByType: GroupByType = 'year';

    /* Outlets within the timeline template where the dataNodes will be inserted. */
    /** @hidden */
    @ViewChild(TimelineFirstListOutletDirective, { static: true })
    private _firstListOutlet: TimelineFirstListOutletDirective;

    /** @hidden */
    @ViewChild(TimelineSecondListOutletDirective, { static: true })
    private _secondListOutlet: TimelineSecondListOutletDirective;

    /** The timeline node template for the timeline */
    /** @hidden */
    @ContentChildren(TimelineNodeDefDirective, { descendants: true })
    private _nodeDefs: QueryList<TimelineNodeDefDirective<T>>;

    /** @hidden */
    _canShowFirstList = true;

    /** @hidden */
    _canShowSecondList = true;

    /** @hidden */
    _groupedNodes: GroupedData[] = [];

    /** Differ used to find the changes in the data provided by the data source. */
    private _dataDifferForFirstList: IterableDiffer<T>;
    private _dataDifferForSecondList: IterableDiffer<T>;

    private _isRtl: boolean = null;

    /** @hidden */
    private readonly _onDestroy = new Subject<void>();

    /** @hidden */
    constructor(
        private _differs: IterableDiffers,
        private _cd: ChangeDetectorRef,
        private _timelinePositionControlService: TimelinePositionControlService,
        @Optional() private _rtlService: RtlService,
    ) {
    }

    /** @hidden */
    ngOnInit(): void {
        this._dataDifferForFirstList = this._differs.find([]).create(this.trackBy);
        this._dataDifferForSecondList = this._differs.find([]).create(this.trackBy);
    }

    /** @hidden */
    ngOnChanges(changes: SimpleChanges): void {
        if ('axis' in changes || 'layout' in changes || 'groupByProperty' in changes) {
            // if (this.layout === 'double' && this.groupByProperty) {
            //     this.layout = this.axis === 'vertical' ? 'left' : 'top';
            // }
            this._canShowFirstList = this.layout !== 'right' && this.layout !== 'bottom';
            this._canShowSecondList = this.layout !== 'left' && this.layout !== 'top';
            this._setPositionStrategy();
        }
        if ('dataSource' in changes && !changes['dataSource'].firstChange) {
            const value = changes['dataSource'].currentValue;
            this.switchDataSource(value);
        }
    }

    /** @hidden */
    ngAfterViewInit(): void {
        this._setPositionStrategy();
        this.switchDataSource(this.dataSource);
    }

    /** @hidden */
    ngOnDestroy(): void {
        this._firstListOutlet.viewContainer.clear();
        this._onDestroy.next();
        this._onDestroy.complete();
    }

    /**
     * Update state by new data source
     * If the data source is null, interpret this by clearing the node outlet.
     */
    /** @hidden */
    private switchDataSource(data: T[]): void {
        if (!data) {
            this._firstListOutlet.viewContainer.clear();
            return;
        }
        if (this._nodeDefs) {
            const [first, second] = this._getListsToRender(data);
            if (first.length) {
                this._renderNodeChanges(first, this._dataDifferForFirstList, this._firstListOutlet?.viewContainer);
            }
            if (second.length) {
                this._renderNodeChanges(second, this._dataDifferForSecondList, this._secondListOutlet?.viewContainer);
            }
            this._cd.detectChanges();
            if (this.groupByProperty && this.groupByType) {
                this._groupedNodes = this._timelinePositionControlService.getGroupedNodes(this.groupByProperty, this.dataSource, this.groupByType);
                this._cd.detectChanges();
            }
            this._timelinePositionControlService.calculatePositions();
            this._cd.detectChanges();
        }
    }

    /** Check for changes made in the data and render each change (node added/removed/moved). */
    /** @hidden */
    private _renderNodeChanges(data: T[], differ: IterableDiffer<T>, vcr: ViewContainerRef): void {
        const changes = differ.diff(data);
        if (!changes) {
            return;
        }
        changes.forEachOperation((item: IterableChangeRecord<T>,
                                  adjustedPreviousIndex: number | null,
                                  currentIndex: number | null) => {
            if (item.previousIndex === null) {
                this._insertNode(data[currentIndex], currentIndex, vcr);
            } else if (currentIndex === null) {
                vcr.remove(adjustedPreviousIndex);
            } else {
                const view = vcr.get(adjustedPreviousIndex);
                vcr.move(view, currentIndex);
            }
        });
    }

    private _setPositionStrategy(): void {
        this._timelinePositionControlService.setStrategy(`${this.axis}-${this.layout}` as TimeLinePositionStrategy,
            {
                grouping: !!this.groupByType
            });
    }

    /**
     * Create the embedded view for the data node template and place it in the correct index location
     * within the data node view container.
     */
    /** @hidden */
    private _insertNode(nodeData: T, index: number, vcr: ViewContainerRef): void {
        const node = this._getNodeDef(index);

        // Node context that will be provided to created embedded view
        const context = new TimelineNodeOutletContext<T>(nodeData);

        vcr.createEmbeddedView(node.template, context, index);
    }

    /**
     * Finds the matching node definition that should be used for this node data. If there is only
     * one node definition, it is returned.
     */
    /** @hidden */
    private _getNodeDef(i: number): TimelineNodeDefDirective<T> {
        if (this._nodeDefs.length === 1) {
            return this._nodeDefs.first;
        }
        return this._nodeDefs[i];
    }


    private _getListsToRender(dataSource: T[]): T[][] {
        let dataForFirstList = [];
        let dataForSecondList = [];
        if (this.layout === 'left' || this.layout === 'top') {
            dataForFirstList = [...dataSource];
        } else if (this.layout === 'right' || this.layout === 'bottom') {
            dataForSecondList = [...dataSource];
        } else {
            return this._getDoubleList(dataSource)
        }
        return [dataForFirstList, dataForSecondList];
    }

    private _getDoubleList(dataSource: T[]): T[][] {
        const dataForFirstList = [];
        const dataForSecondList = [];

        if (!this.groupByProperty) {
            dataSource.forEach((item, index) => {
                if (index % 2 === 0) {
                    dataForFirstList.push(item);
                } else {
                    dataForSecondList.push(item);
                }
            });
        } else {
            const arrToSplit = this._getGroupedItems(dataSource);
            arrToSplit.forEach(item => {
                if (item.length === 1) {
                    dataForFirstList.push(item[0]);
                    return;
                }
                item.forEach((groupedItem, index) => {
                    if (index % 2 === 0) {
                        dataForFirstList.push(groupedItem);
                    } else {
                        dataForSecondList.push(groupedItem);
                    }
                });
            });
        }
        return [dataForFirstList, dataForSecondList];
    }

    private _getGroupedItems(data: T[]): T[][] {
        const buffer = {};
        data.forEach((dataItem) => {
            if (!buffer[dataItem[this.groupByProperty]]) {
                buffer[dataItem[this.groupByProperty]] = [];
            }
            buffer[dataItem[this.groupByProperty]].push(dataItem);
        });
        return Object.values(buffer)
    }
}
