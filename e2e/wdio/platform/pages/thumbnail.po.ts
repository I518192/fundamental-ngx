import { BaseComponentPo } from './base-component.po';
import { waitForElDisplayed } from '../../driver/wdio';

export class ThumbnailPo extends BaseComponentPo {
    url = '/thumbnail';
    root = '#page-content';

    mainImage = '.fdp-media-container img';
    mainVideo = '.fdp-media-container video';
    dialogMainImg = '[role="dialog"] img';
    verticalGalleryImages = 'fdp-platform-thumbnail-basic-example fd-avatar';
    horizontalGalleryImages = 'fdp-platform-thumbnail-horizontal-example fd-avatar';
    horizontalMainImg = 'fdp-platform-thumbnail-horizontal-example img';
    verticalGalleryVideo = 'fdp-platform-thumbnail-video-media-example fd-avatar';
    galleryDialog = '[role="dialog"]';
    galleryDialogCloseButton = this.galleryDialog + ' button.fd-button--transparent';
    galleryDialogLeftArrowButton = this.galleryDialog + ' button.fdp-thumbnail-button--left';
    galleryDialogRightArrowButton = this.galleryDialog + ' button.fdp-thumbnail-button--right';

    open(): void {
        super.open(this.url);
        waitForElDisplayed(this.mainImage);
    }

    getScreenshotFolder(): Record<string, any> {
        return super.getScreenshotFolder(this.url);
    }

    saveExampleBaselineScreenshot(specName: string = 'thumbnail'): void {
        super.saveExampleBaselineScreenshot(specName, this.getScreenshotFolder());
    }

    compareWithBaseline(specName: string = 'thumbnail'): any {
        return super.compareWithBaseline(specName, this.getScreenshotFolder());
    }
}
