import { api, LightningElement } from 'lwc';

export default class StudentsList extends LightningElement {
    @api students;

    handleFinalization() {
        // Agregamos una confirmación visual
        const confirmEvent = new CustomEvent('save', {
            detail: this.students,
            bubbles: true,
            composed: true
        });
        
        this.dispatchEvent(confirmEvent);
        console.log('Finalización de la toma de asistencia: ' + JSON.stringify(this.students));
    }
}