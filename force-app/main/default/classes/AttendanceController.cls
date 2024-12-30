public with sharing class AttendanceController {
    /*
    Método para obtener la lista de estudiantes
    @return List<Contact> - Retorna una lista con alumnos
    */
    @AuraEnabled(cacheable=true)
    public static List<Contact> getStudents() {
        return [
            SELECT Id, FirstName, LastName, Order__c
            FROM Contact
            WITH SECURITY_ENFORCED
            ORDER BY LastName
        ];
    }

    /*
    Método para obtener la lista de asistencia del día actual
    @return List<Event> - Retorna una lista con alumnos
    */
    @AuraEnabled(cacheable=true)
    public static List<Event> getAttendance() {
        return [
            SELECT Id, WhoId, Who.FirstName, Who.LastName, StartDateTime, Type
            FROM Event
            WHERE DAY_ONLY(StartDateTime) = TODAY 
            AND Type IN ('Presente', 'Ausente')
        ];
    }
}