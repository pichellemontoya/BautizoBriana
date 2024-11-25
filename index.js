// Importar el cliente de Supabase
import { supabase } from './supabaseClient';  // Asegúrate de que el cliente supabaseClient.js está correctamente exportado

// Obtener el combo de invitados
const invitadosDropdown = document.getElementById('invitados-dropdown');

// Función para cargar los invitados desde la tabla "Invitados"
async function cargarInvitados() {
  const { data, error } = await supabase
    .from('Invitados')  // Nombre de la tabla en Supabase
    .select('InvitadoID, Familia');  // Aquí seleccionamos las columnas que queremos (InvitadoID y Familia)

  if (error) {
    console.error('Error al obtener los invitados:', error);
    return;
  }

  // Agregar los invitados al combo
  data.forEach(invitado => {
    const option = document.createElement('option');
    option.value = invitado.InvitadoID;  // El valor será el InvitadoID del invitado
    option.textContent = invitado.Familia;  // El texto será el Familia del invitado
    invitadosDropdown.appendChild(option);
  });
}

// Llamar la función para cargar los invitados cuando se carga la página
document.addEventListener('DOMContentLoaded', cargarInvitados);
