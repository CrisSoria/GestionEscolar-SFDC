import {LightningElement, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import getStudents from "@salesforce/apex/AttendanceController.getStudents";
import createAttendance from "@salesforce/apex/AttendanceController.createAttendance";

export default class TakeAttendance extends LightningElement {
    students; //lista de todos los estudiantes desde SFDC

    @track studentAtt; //estudiante al que se le está tomando asistencia
    contStudent = 0; //index del estudiante al que se le está tomando asistencia
    eventsToUpsert = {}; // { "0038W00001sOzTfQAK":"Presente","0038W00001sOzTgQAK":"Ausente", ... }
    showAtt = false; //controla cuando dejar de mostrar el LWC para tomar asistencia
    studentsAbsents = []; //lista de alumnos ausentes

    @track isLoading = false;
    @track error;

    @wire(getStudents)
    wiredStudents(result) {
        this.isLoading = true;
        const { error, data } = result;
        if (error) {
            this.isLoading = false;
            this.error = "Error cargando los estudiantes: " + error;
            console.error('Error cargando los estudiantes:', error);
        }

        if (data) {
            if(data.length > 0) {
                this.students = data;
                this.studentAtt = this.students[0];
                this.isLoading = false;
                this.showAtt = true;
            } else {
                this.isLoading = false;
                this.error = "No hay estudiantes en la base de datos";
            }
        }
    }

    connectedCallback() {
        // if (this.students?.length > 0) {
        //     this.studentAtt = this.students[0];
        //     this.showAtt = true;
        // }
        //evitar la perdida de datos al recargar la página mientras se toma asistencia
        window.addEventListener('beforeunload', this.handleBeforeUnload);
    }
    disconnectedCallback() {
        window.removeEventListener('beforeunload', this.handleBeforeUnload);
    }
    handleBeforeUnload = (event) => {
        if (Object.keys(this.eventsToUpsert).length > 0) {
            event.preventDefault();
            event.returnValue = '';
        }
    }


    get isFirstStudent() {
        return this.contStudent === 0;
    }
    
    get currentStudentNumber() {
        return this.contStudent + 1;
    }
    
    get totalStudents() {
        return this.students?.length || 0;
    }

    nextStudent() {
        if (this.students.length > this.contStudent + 1) {
            this.contStudent++;
            this.studentAtt = this.students[this.contStudent];
        }else{
            this.showAtt = false;
        }
    }
    prevStudent() {
        if (this.contStudent > 0) {
            this.contStudent--;
            this.studentAtt = this.students[this.contStudent];
        }
    }

    handleAbsent() {
        if (this.students[this.contStudent]) {
            const key = this.students[this.contStudent].Id;
            const value = 'Ausente'
            
            this.eventsToUpsert[key] = value;
            this.studentsAbsents.push(this.students[this.contStudent]);
            this.nextStudent();
        }
    }

    handlePresent() {
        if (this.students[this.contStudent]) {
            const key = this.students[this.contStudent].Id;
            const value = 'Presente'
            this.eventsToUpsert[key] = value;
            this.removeStudentsAbsents(key); //para corregir la lista de ausentes
            this.nextStudent();
        }
    }
    //método para quitar a los alumnos en caso de cambiar su estado de ausente a presente
    removeStudentsAbsents(idToRemove) {
        let index = this.studentsAbsents.findIndex(item => item.Id === idToRemove);
        if (index !== -1) { 
            this.studentsAbsents.splice(index, 1); 
        }
    }

    handleSaveAttendance() {

        this.isLoading = true;

        createAttendance({ IdAtt: this.eventsToUpsert })
            .then(result => {
                const e = new CustomEvent('saveatt', {
                    detail : "dato que quiero enviar"
                })
                this.dispatchEvent(e);
                
                const evt = new ShowToastEvent({
                    title: 'Éxito',
                    message: result,
                    variant: 'success'
                });
                this.dispatchEvent(evt);
                this.eventsToUpsert = {}; // Limpiar los cambios después de guardar
                
            })
            .catch(error => {
                console.error('Error cargando la asistencia:', error);
                this.error = error.body?.message || 'Error al importar los eventos';
            })
            .finally(() => {
                this.isLoading = false;
            });
    }
}