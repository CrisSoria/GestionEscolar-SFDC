import { api, LightningElement, track } from 'lwc';

export default class TakeAttendance extends LightningElement {
    @api students; //lista de todos los estudiantes desde SFDC
    @track studentAtt; //estudiante al que se le está tomando asistencia
    contStudent = 0; //index del estudiante al que se le está tomando asistencia
    eventsToUpsert = {}; // [{"IdStudent":"0038W00001sOzTfQAK","Attendance":"Presente"},{"IdStudent":"0038W00001sOzTgQAK","Attendance":"Ausente"}]
    showAtt = false; //controla cuando dejar de mostrar el LWC para tomar asistencia
    studentsAbsents = []; //lista de alumnos ausentes

    connectedCallback() {
        if (this.students?.length > 0) {
            this.studentAtt = this.students[0];
            this.showAtt = true;
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

    handleFinalization() {
        // Llamar al método de la clase Apex
        // {"0038W00001sOzTfQAK":"Presente","0038W00001sOzTgQAK":"Presente","0038W00001sOzTiQAK":"Presente","0038W00002b9gdrQAA":"Ausente","0038W00002b9iMDQAY":"Presente","0038W00001sOzTjQAK":"Presente","0038W00001sOzTqQAK":"Presente","0038W00001sOzTbQAK":"Ausente","0038W00001sOzTrQAK":"Presente","0038W00001sOzTaQAK":"Ausente","0038W00001sOzTmQAK":"Presente","0038W00001sOzTkQAK":"Ausente","0038W00001sOzToQAK":"Presente","0038W00001sOzTnQAK":"Presente","0038W00001sOzTtQAK":"Presente","0038W00001sOzTsQAK":"Presente","0038W00001sOzThQAK":"Presente","0038W00002b9iMNQAY":"Presente","0038W00001sOzTpQAK":"Presente","0038W00001sOzTcQAK":"Presente","0038W00001sOzTlQAK":"Presente","0038W00002b9iLdQAI":"Presente","0038W00001sOzTdQAK":"Presente","0038W00002b9SxvQAE":"Presente","0038W00001sOzTeQAK":"Presente"}
        
        console.log('Finalización de la toma de asistencia: ' + JSON.stringify(this.eventsToUpsert));
    }
}