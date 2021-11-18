import { Component, ElementRef, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { WizardStepComponent, WizardStepStatus } from '.';

import { WizardService } from './wizard.service';

@Component({
    template: `
        <a fd-wizard-step href="#" #testTemplate1 [status]="step1status">test</a>
        <a fd-wizard-step href="#" #testTemplate2>test</a>
        <a fd-wizard-step href="#" #testTemplate3>test</a>
    `
})
class TemplateTestComponent {
    @ViewChild('testTemplate1', { static: true }) anchor1: WizardStepComponent;
    @ViewChild('testTemplate2', { static: true }) anchor2: WizardStepComponent;
    @ViewChild('testTemplate3', { static: true }) anchor3: WizardStepComponent;

    /** @hidden */
    @ViewChildren(WizardStepComponent)
    steps: QueryList<WizardStepComponent>;

    step1status: WizardStepStatus = 'completed';
}

describe('WizardService', () => {
    let service: WizardService;
    let anchors: WizardStepComponent[];
    let wSteps: QueryList<WizardStepComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [TemplateTestComponent],
            providers: [WizardService]
        }).compileComponents();

        service = TestBed.get(WizardService);
        const componentInstance = TestBed.createComponent(TemplateTestComponent).componentInstance;
        anchors = [componentInstance.anchor1, componentInstance.anchor2, componentInstance.anchor3];
        wSteps = componentInstance.steps;
    });

    it('should create', () => {
        expect(service).toBeDefined();
    });

    it('should handle focus', () => {
        const elements = anchors.map((anchor) => anchor);
        spyOn(elements[1].progressBarLink.nativeElement, 'focus');
        elements[1].status = 'completed';
        service.progressBarKeyHandler({ key: 'ArrowRight' }, wSteps, 0);
        expect(elements[1].progressBarLink.nativeElement.focus).toHaveBeenCalled();
    });

    it('should handle focus on first element, when reached last', () => {
        const elements = anchors.map((anchor) => anchor.progressBarLink.nativeElement);
        spyOn(elements[0], 'focus');
        elements[0].status = 'completed';
        service.progressBarKeyHandler({ key: 'ArrowRight' }, wSteps, 2);
        expect(elements[0].focus).toHaveBeenCalled();
    });

    it('should handle focus on last element, when reached before first', () => {
        const elements = anchors.map((anchor) => anchor.progressBarLink.nativeElement);
        spyOn(elements[2], 'focus');
        elements[2].status = 'completed';
        service.progressBarKeyHandler({ key: 'ArrowLeft' }, wSteps, 0);
        expect(elements[2].focus).toHaveBeenCalled();
    });
});
