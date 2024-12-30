public with sharing class AttendanceController {
    /*
    * Método para obtener la lista de estudiantes
    * @return List<Contact> - Retorna una lista con alumnos
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
    * clase Wrapper que combina un Event y un Contact
    */
    public class EventContactWrapper {
        @AuraEnabled public Event event { get; set; }
        @AuraEnabled public Contact contact { get; set; }
    
        // Constructor
        public EventContactWrapper(Event e, Contact c) {
            this.event = e;
            this.contact = c;
        }
    }
    /*
    * clase privada que combina un Event y un Contact
    */
    private static List<EventContactWrapper> combineEventAndContact(List<Event> events, List<Contact> contacts) {
        // Crear un mapa de Contactos utilizando el Id
        Map<Id, Contact> contactMap = new Map<Id, Contact>();
        for (Contact c : contacts) {
            contactMap.put(c.Id, c);  // El contacto se asocia por su Id
        }
    
        // Lista para almacenar el resultado combinado
        List<EventContactWrapper> resultList = new List<EventContactWrapper>();
    
        // Recorrer los eventos y combinar con los contactos si el WhoId coincide
        for (Event e : events) {
            if (contactMap.containsKey(e.WhoId)) { // Verificar si el Contacto existe para el WhoId del Evento
                Contact matchedContact = contactMap.get(e.WhoId);
                EventContactWrapper wrapper = new EventContactWrapper(e, matchedContact);
                resultList.add(wrapper);
            }
        }
    
        return resultList; // Retornar la lista combinada
    }
    /*
    * Método para obtener la lista de asistencia del día actual
    * @return List<EventContactWrapper> - Retorna una lista con alumnos y su asistencia
    */
    @AuraEnabled(cacheable=true)
    public static List<EventContactWrapper> getAttendance() {
        List<Event> todayAttendance = [
                SELECT Id, WhoId, Who.FirstName, Who.LastName, StartDateTime, Type
                FROM Event
                WHERE DAY_ONLY(StartDateTime) = TODAY 
                AND Type IN ('Presente', 'Ausente')
        ];
        
        List<Contact> students = getStudents();
        
        List<EventContactWrapper> combinedList = combineEventAndContact(todayAttendance, students);
        return combinedList;
    }

    /*
    * Método para guardar la asistencia del día actual
    * @param IdAtt - key: Id del Contact , value: 'Presente' o 'Ausente'
    * @return String - Resultado del registro de asistencia
    */
    @AuraEnabled
    public static String createAttendance(Map<Id,String> IdAtt) {
        try {
            if(IdAtt.isEmpty()){
                throw new CustomException('El argumento de createAttendance está vacío');
            }
            
            // Validación de los valores
            for (String status : IdAtt.values()) {
                if (status != 'Presente' && status != 'Ausente') {
                    throw new CustomException('El valor de estado debe ser "Presente" o "Ausente".');
                }
            }

            // Lista de eventos a crear
            List<Event> eventsToInsert = new List<Event>();
            // DateTime startDateTime = DateTime.newInstance(Date.today(), Time.newInstance(0, 0, 0, 0));
            // DateTime endDateTime = DateTime.newInstance(Date.today(), Time.newInstance(23, 59, 59, 0));

            // Creamos los eventos
            for (Id idContact : IdAtt.keySet()) {
                Event newEvent = new Event();
                newEvent.Subject = 'Other';
                newEvent.IsAllDayEvent = true;
                newEvent.StartDateTime = Date.today();
                newEvent.WhoId = idContact;
                newEvent.Type = IdAtt.get(idContact);
                
                eventsToInsert.add(newEvent);
            }

            // Realizar la inserción en lotes
            /*
            Integer successCount = 0;
            List<String> errors = new List<String>();
            
            if (!eventsToInsert.isEmpty()) {
                
                Integer batchSize = 150;
                
                for (Integer i = 0; i < eventsToInsert.size(); i += batchSize) {
                    List<Event> batch = new List<Event>();
                    for (Integer j = i; j < Math.min(i + batchSize, eventsToInsert.size()); j++) {
                        batch.add(eventsToInsert[j]);
                    }
                    
                    List<Database.SaveResult> results = Database.insert(batch, false);
                    for (Database.SaveResult result : results) {
                        if (result.isSuccess()) {
                            successCount++;
                        } else {
                            errors.add('Error con el evento: ' + result.getErrors()[0].getMessage());
                        }
                    }
                }
                    */

            // Realizar la inserción
			List<Database.SaveResult> results = new List<Database.SaveResult>();
			if (!eventsToInsert.isEmpty()) {
				results = Database.insert(eventsToInsert, false);
			}

			// Procesar resultados
			Integer successCount = 0;
			List<String> errors = new List<String>();

			for (Database.SaveResult result : results) {
				if (result.isSuccess()) {
					successCount++;
				} else {
					errors.add(String.join(result.getErrors(), ', '));
				}
			}
            if (!errors.isEmpty()) {
                throw new CustomException(
                    'Se importaron ' +
                    successCount +
                    ' registros. Errores: ' +
                    String.join(errors, '; ')
                    );
                }
                
                return 'Se registraron ' + successCount + ' asistencias exitosamente';
            

        } catch (CustomException e) {
            System.debug('Error personalizado en createAttendance: ' + e.getMessage());
            throw new AuraHandledException('Error al crear la asistencia: ' + e.getMessage());
        } catch (Exception e) {
            System.debug('Error inesperado en la línea N°: ' + e.getLineNumber());
            System.debug('Error en createAttendance: ' + e.getMessage());
            System.debug('Error stack trace: ' + e.getStackTraceString());
            throw new AuraHandledException('Error al crear la asistencia: ' + e.getMessage());
        }
    }

    /*
	 * Clase personalizada para manejo de excepciones
	 */
	public class CustomException extends Exception {
	}
}