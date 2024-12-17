const API_URL = 'https://ivoetjclejmrvnbrqryg.supabase.co/rest/v1/Invitados';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2b2V0amNsZWptcnZuYnJxcnlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI1NDE4NDQsImV4cCI6MjA0ODExNzg0NH0.6u9I8ssWkbFveR5RFjv-MeIFVOOz9S6KgHEFmtLOpec'; // Reemplaza con tu clave

const headers = {
  apikey: API_KEY,
  Authorization: `Bearer ${API_KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'return=minimal',
};

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('invitado-form');
  const tbody = document.getElementById('invitados-tbody');
  const filterButtons = document.querySelectorAll('.filters button');

  // Mostrar/Ocultar campos adicionales al editar
  const toggleModificarCampos = (isEditing) => {
    const modificarCampos = document.getElementById('modificar-campos');
    if (isEditing) {
      modificarCampos.style.display = 'block';
    } else {
      modificarCampos.style.display = 'none';
      document.getElementById('adultosConfirmados').value = '';
      document.getElementById('niniosConfirmados').value = '';
      document.getElementById('bAsiste').value = 'false';
    }
  };

  const calcularTotales = () => {
    const filas = document.querySelectorAll('#invitados-tbody tr');
    let totalAdultos = 0;
    let totalAdultosConfirmados = 0;
    let totalNinios = 0;
    let totalNiniosConfirmados = 0;
    let totalConfirmados = 0;
    let totalRespondieron = 0;

    filas.forEach((fila) => {
      const adultos = parseInt(fila.children[2]?.textContent || '0', 10);
      const adultosConfirmados = parseInt(fila.children[3]?.textContent || '0', 10);
      const ninios = parseInt(fila.children[4]?.textContent || '0', 10);
      const niniosConfirmados = parseInt(fila.children[5]?.textContent || '0', 10);
      const confirmados = fila.children[7]?.textContent === 'Sí' ? 1 : 0;
      const respondieron = fila.children[6]?.textContent === 'Sí' ? 1 : 0;

      totalAdultos += adultos;
      totalAdultosConfirmados += adultosConfirmados;
      totalNinios += ninios;
      totalNiniosConfirmados += niniosConfirmados;
      totalConfirmados += confirmados;
      totalRespondieron += respondieron;
    });

    document.getElementById('total-adultos').textContent = totalAdultos;
    document.getElementById('total-adultos-confirmados').textContent = totalAdultosConfirmados;
    document.getElementById('total-ninios').textContent = totalNinios;
    document.getElementById('total-ninios-confirmados').textContent = totalNiniosConfirmados;
    document.getElementById('total-confirmados').textContent = totalConfirmados;
    document.getElementById('total-respondieron').textContent = totalRespondieron;
  };

  const calcularTotalesGenerales = async () => {
    const query = `${API_URL}?select=*`;
    const response = await fetch(query, { headers });
    const data = await response.json();

    let totalAdultosConfirmados = 0;
    let totalNiniosConfirmados = 0;
    let totalConfirmados = 0;
    let totalRespondieron = 0;

    data.forEach((invitado) => {
      const adultosConfirmados = parseInt(invitado.AdultosConfirmados || '0', 10);
      const niniosConfirmados = parseInt(invitado.NiniosConfirmados || '0', 10);
      const confirmados = invitado.bAsiste ? 1 : 0;
      const respondieron = invitado.bResponde ? 1 : 0;
      totalAdultosConfirmados += adultosConfirmados;
      totalNiniosConfirmados += niniosConfirmados;
      totalConfirmados += confirmados;
      totalRespondieron += respondieron;
    });

    document.getElementById('total-general-adultos-confirmados').textContent = totalAdultosConfirmados;
    document.getElementById('total-general-ninios-confirmados').textContent = totalNiniosConfirmados;
    document.getElementById('total-general-confirmados').textContent = totalConfirmados;
    document.getElementById('total-general-respondieron').textContent = totalRespondieron;
  };

  const fetchInvitados = async (filter = 'all') => {
    let query = `${API_URL}?select=*&order=Familia.asc`;

    if (filter === 'responded') query += '&bResponde=eq.true';
    if (filter === 'not-responded') query += '&bResponde=eq.false';
    if (filter === 'attending') query += '&bResponde=eq.true&bAsiste=eq.true';
    if (filter === 'not-attending') query += '&bResponde=eq.true&bAsiste=eq.false';

    const response = await fetch(query, { headers });
    const data = await response.json();

    tbody.innerHTML = data
      .map((invitado) => `
      <tr>
        <td style="display:none;">${invitado.InvitadoID}</td>
        <td>${invitado.Familia}</td>
        <td>${invitado.Adultos}</td>
        <td>${invitado.AdultosConfirmados}</td>
        <td>${invitado.Ninios}</td>
        <td>${invitado.NiniosConfirmados}</td>
        <td>${invitado.bResponde ? 'Sí' : 'No'}</td>
        <td>${invitado.bAsiste ? 'Sí' : 'No'}</td>
        <td>
          <button class="edit" data-id="${invitado.InvitadoID}" title="Editar">
            <i class="fas fa-edit"></i>
          </button>
          <button class="delete" data-id="${invitado.InvitadoID}" title="Eliminar">
            <i class="fas fa-trash-alt"></i>
          </button>
        </td>
      </tr>
    `)
      .join('');
    calcularTotalesGenerales();
    calcularTotales();
  };

  const saveInvitado = async (invitado) => {
    const isEditing = !!invitado.InvitadoID;
    const method = isEditing ? 'PATCH' : 'POST';
    const url = isEditing ? `${API_URL}?InvitadoID=eq.${invitado.InvitadoID}` : API_URL;
    
    invitado.bAsiste = document.getElementById('bAsiste').value === 'true';
    // Elimina la propiedad InvitadoID si es un registro nuevo
    if (!isEditing) {
      invitado.bAsiste = false;
    }
  
    invitado.bResponde = form.id.value ? document.getElementById('bResponde').value === 'true' : false;
    invitado.AdultosConfirmados = Number(document.getElementById('adultosConfirmados').value) || 0;
    invitado.NiniosConfirmados = Number(document.getElementById('niniosConfirmados').value) || 0;
  
    try {
      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(invitado),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error al guardar el invitado:', errorData);
        alert('No se pudo guardar el invitado. Revisa los datos e inténtalo de nuevo.');
        return;
      }
  
      fetchInvitados();
      form.reset();
      toggleModificarCampos(false);
    } catch (error) {
      console.error('Error en la solicitud:', error);
      alert('Hubo un problema al guardar el invitado.');
    }
  };
  

  const deleteInvitado = async (id) => {
    await fetch(`${API_URL}?InvitadoID=eq.${id}`, {
      method: 'DELETE',
      headers,
    });
    fetchInvitados();
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
  
    const invitado = {
      Familia: form.familia.value,
      Adultos: Number(form.adultos.value),
      Ninios: Number(form.ninios.value),
    };
  
    if (form.id.value) {
      invitado.InvitadoID = form.id.value; // Solo incluir si es edición
    }
  
    saveInvitado(invitado);
  });

  tbody.addEventListener('click', (e) => {
    const button = e.target.closest('button');
    if (!button) return;
  
    if (button.classList.contains('edit')) {
      const row = button.closest('tr');
      form.id.value = row.children[0].textContent;
      form.familia.value = row.children[1].textContent;
      form.adultos.value = row.children[2]?.textContent || 0;
      form.ninios.value = row.children[4]?.textContent || 0;
      document.getElementById('adultosConfirmados').value = row.children[3]?.textContent || 0;
      document.getElementById('niniosConfirmados').value = row.children[5]?.textContent || 0;
      document.getElementById('bAsiste').value = row.children[7]?.textContent === 'Sí' ? 'true' : 'false';
      document.getElementById('bResponde').value = row.children[6]?.textContent === 'Sí' ? 'true' : 'false';
      toggleModificarCampos(true);
  
      // Desplazarse suavemente hacia el formulario
      form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (button.classList.contains('delete')) {
      const id = button.dataset.id;
      if (confirm('¿Seguro que deseas eliminar este invitado?')) {
        deleteInvitado(id);
      }
    }
  });

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      fetchInvitados(filter);
    });
  });

  document.getElementById('exportar-excel').addEventListener('click', () => {
    const originalTable = document.querySelector('table');
    const tempTable = originalTable.cloneNode(true);

    tempTable.querySelectorAll('thead tr th:first-child').forEach(th => th.remove());
    tempTable.querySelectorAll('thead tr th:last-child').forEach(th => th.remove());
    tempTable.querySelectorAll('tbody tr').forEach(row => row.removeChild(row.firstElementChild));
    tempTable.querySelectorAll('tbody tr').forEach(row => row.removeChild(row.lastElementChild));

    // Generar el archivo Excel con la tabla modificada
    const wb = XLSX.utils.table_to_book(tempTable, { sheet: 'Invitados' });
    XLSX.writeFile(wb, 'invitados.xlsx');
  });

  document.getElementById('limpiar-formulario').addEventListener('click', () => {
    form.reset();
    toggleModificarCampos(false);
  });

  fetchInvitados();
});
