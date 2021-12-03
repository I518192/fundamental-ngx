import { Directive, HostBinding, Input } from '@angular/core';

@Directive({
    selector: '[fdListFooter], [fd-list-footer]'
})
export class ListFooterDirective {
    /** @hidden */
    @HostBinding('class.fd-list__footer')
    fdListFooterClass = true;

    /** Whether to apply "aria-hidden" attribute. */
    @Input()
    @HostBinding('attr.aria-hidden')
    ariaHidden = true;
}
