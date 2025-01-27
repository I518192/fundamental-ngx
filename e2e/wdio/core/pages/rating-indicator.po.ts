import { CoreBaseComponentPo } from './core-base-component.po';
import { waitForElDisplayed, waitForPresent } from '../../driver/wdio';

export class RatingIndicatorPo extends CoreBaseComponentPo {
    url = '/rating-indicator';
    root = '#page-content';

    starsRatingExamples = '[name="rating-0"]';
    starsRatingDisplayMode = '[name="rating-6"]';
    starsRatingDynamicChanges = '[name="rating-13"]';
    containerDynamicChanges = '.is-display-mode';
    inputsBasicExample = 'fd-rating-indicator-example input.ng-pristine';
    touchedInputsBasicExample = 'fd-rating-indicator-example input.ng-dirty';
    inputsDynamicChanges = 'fd-ri-dynamic-example input.ng-pristine';
    touchedInputsDynamicChanges = 'fd-ri-dynamic-example input.ng-dirty';
    sizeRatingIndicator = '[area-label="Total raiting"]';

    open(): void {
        super.open(this.url);
        waitForElDisplayed(this.root);
        waitForPresent(this.title);
    }

    getScreenshotFolder(): Record<string, any> {
        return super.getScreenshotFolder(this.url);
    }

    saveExampleBaselineScreenshot(specName: string = 'rating-indicator'): void {
        super.saveExampleBaselineScreenshot(specName, this.getScreenshotFolder());
    }

    compareWithBaseline(specName: string = 'rating-indicator'): any {
        return super.compareWithBaseline(specName, this.getScreenshotFolder());
    }
}
