import { ChangeDetectionStrategy, Component, ViewEncapsulation, Input } from '@angular/core';
import { PopoverComponent } from '../../popover/popover.component';

@Component({
    selector: 'fd-product-switch',
    templateUrl: './product-switch.component.html',
    styleUrls: ['./product-switch.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductSwitchComponent extends PopoverComponent {
    //aria-label for screen readers
    @Input() ariaLabel = "";
}
