import { api, LightningElement } from 'lwc';

export default class TakeAttendance extends LightningElement {
    @api student;

    handleAbsent() {
        this.dispatchEvent(new CustomEvent('absent', {
            detail: false,
            bubbles: true,
            composed: true
        }));
    }

    handlePresent() {
        this.dispatchEvent(new CustomEvent('present', {
            detail: true,
            bubbles: true,
            composed: true
        }));
    }
}