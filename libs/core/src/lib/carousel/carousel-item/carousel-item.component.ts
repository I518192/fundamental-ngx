import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild,
    ElementRef,
    HostBinding,
    Input,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import { CarouselItemInterface } from '../carousel.service';

let carouselItemUniqueId = 0;

@Component({
    selector: 'fd-carousel-item',
    templateUrl: './carousel-item.component.html',
    styleUrls: ['carousel-item.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class CarouselItemComponent implements CarouselItemInterface, OnInit {
    /** add #imgInfo to <img> to get attr.alt*/
    @ContentChild('imgInfo', { static: true }) imgInfoRef: ElementRef;

    /** Id of the Carousel items. */
    @Input()
    @HostBinding('attr.id')
    id = `fd-carousel-item-${carouselItemUniqueId++}`;

    /** Sets aria-label attribute for carousel item */
    @Input()
    @HostBinding('attr.aria-label')
    ariaLabel: string;

    /** Sets aria-labelledby attribute for carousel item */
    @Input()
    @HostBinding('attr.aria-labelledby')
    ariaLabelledBy: string;

    /** Sets aria-describedby attribute for carousel item */
    @Input()
    @HostBinding('attr.aria-describedby')
    ariaDescribedBy: string;

    /**
     * Loading indicator when item is not yet loaded
     */
    @Input()
    loading = false;

    /** Sets tooltip for carousel item */
    @Input()
    @HostBinding('attr.title')
    title = null;

    /** Initial height value, needed when carousel is inside popover */
    @Input()
    initialHeight: number;

    /** Initial height value, needed when carousel is inside popover */
    @Input()
    initialWidth: number;

    /** Value of carousel item */
    @Input()
    value: any;

    /** @hidden */
    @HostBinding('class.fd-carousel__item')
    carouselItem = true;

    /** @hidden */
    @HostBinding('class.fd-carousel__item--active')
    carouselItemActive = true;

    /**
     * @hidden Handling width height in IE versions.
     */
    @HostBinding('class.fd-carousel--ie-handling')
    ieAutoWidth = true;

    /** @hidden Hide/show slide, useful for managing tab order */
    _visibility: 'visible' | 'hidden' = 'visible';

    /** @hidden */
    set visibility(visibility: 'visible' | 'hidden') {
        this._visibility = visibility;
        this._changeDetectorRef.detectChanges();
    }

    get visibility(): 'visible' | 'hidden' {
        return this._visibility;
    }

    constructor(private readonly _changeDetectorRef: ChangeDetectorRef, private readonly _elementRef: ElementRef) {}

    ngOnInit(): void {
        if (!!this.imgInfoRef) {
            this.title = this.imgInfoRef.nativeElement.getAttribute('alt');
        }
    }

    /** Width of element */
    getWidth(): number {
        return this._elementRef.nativeElement.getBoundingClientRect().width || this.initialWidth;
    }

    /** Height of element */
    getHeight(): number {
        return this._elementRef.nativeElement.getBoundingClientRect().height || this.initialHeight;
    }

    /** Native element  */
    getElement(): any {
        return this._elementRef.nativeElement;
    }
}
