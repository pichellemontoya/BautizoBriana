const API_URL = 'https://ivoetjclejmrvnbrqryg.supabase.co/rest/v1/Invitados';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2b2V0amNsZWptcnZuYnJxcnlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI1NDE4NDQsImV4cCI6MjA0ODExNzg0NH0.6u9I8ssWkbFveR5RFjv-MeIFVOOz9S6KgHEFmtLOpec'; // Reemplaza con tu clave
const CLIENT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2b2V0amNsZWptcnZuYnJxcnlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI1NDE4NDQsImV4cCI6MjA0ODExNzg0NH0.6u9I8ssWkbFveR5RFjv-MeIFVOOz9S6KgHEFmtLOpec'; // Reemplaza con tu clave

const headers = {
  apikey: API_KEY,
  Authorization: `Bearer ${API_KEY}`,
  'Content-Type': 'application/json',
};

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('invitado-form');
  const tbody = document.getElementById('invitados-tbody');
  const filterButtons = document.querySelectorAll('.filters button');

  const calcularTotales = () => {
    const filas = document.querySelectorAll('#invitados-tbody tr');
    let totalAdultos = 0;
    let totalAdultosConfirmados = 0;
    let totalNinios = 0;
    let totalNiniosConfirmados = 0;
    let totalConfirmados = 0;
    let totalRespondieron = 0;
    
    filas.forEach(fila => {
      const adultos = parseInt(fila.children[2].textContent, 10) || 0;
      const adultosConfirmados = parseInt(fila.children[3].textContent, 10) || 0;
      const ninios = parseInt(fila.children[4].textContent, 10) || 0;
      const niniosConfirmados = parseInt(fila.children[5].textContent, 10) || 0;
      const confirmados = fila.children[7].textContent == 'Sí' ? 1 : 0;
      const respondieron = fila.children[6].textContent == 'Sí' ? 1 : 0;
  
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
    let query = `${API_URL}?select=*`;
    const response = await fetch(query, { headers });
    const data = await response.json();

    let totalAdultosConfirmados = 0;
    let totalNiniosConfirmados = 0;
    let totalConfirmados = 0;
    let totalRespondieron = 0;

    data.map(invitado => {
        const adultosConfirmados = parseInt(invitado.AdultosConfirmados) || 0;
        const niniosConfirmados = parseInt(invitado.NiniosConfirmados) || 0;
        const confirmados = invitado.bAsiste ? 1 : 0;
        const respondieron = invitado.bResponde ? 1 : 0;
        totalAdultosConfirmados += adultosConfirmados;
        totalNiniosConfirmados += niniosConfirmados;
        totalConfirmados += confirmados;
        totalRespondieron += respondieron;
    });
    document.getElementById('total-general-adultos-confirmados').innerHTML = totalAdultosConfirmados;
    document.getElementById('total-general-ninios-confirmados').innerHTML = totalNiniosConfirmados;
    document.getElementById('total-general-confirmados').innerHTML = totalConfirmados;
    document.getElementById('total-general-respondieron').innerHTML = totalRespondieron;
  };
  

  const fetchInvitados = async (filter = 'all') => {
    let query = `${API_URL}?select=*&order=Familia.asc`;

    // Aplicar filtro según el caso
    if (filter === 'responded') query += '&bResponde=eq.true';
    if (filter === 'not-responded') query += '&bResponde=eq.false';
    if (filter === 'attending') query += '&bResponde=eq.true&bAsiste=eq.true';
    if (filter === 'not-attending') query += '&bResponde=eq.true&bAsiste=eq.false';

    const response = await fetch(query, { headers });
    const data = await response.json();

    tbody.innerHTML = data.map(invitado => `
      <tr>
        <td style="visibility:collapse; display:none;">${invitado.InvitadoID}</td>
        <td>${invitado.Familia}</td>
        <td>${invitado.Adultos}</td>
        <td>${invitado.AdultosConfirmados}</td>
        <td>${invitado.Ninios}</td>
        <td>${invitado.NiniosConfirmados}</td>
        <td>${invitado.bResponde ? 'Sí' : 'No'}</td>
        <td>${invitado.bAsiste ? 'Sí' : 'No'}</td>
        <td>
          <button class="edit" data-id="${invitado.InvitadoID}">Editar</button>
          <button class="delete" data-id="${invitado.InvitadoID}">Eliminar</button>
        </td>
      </tr>
    `).join('');
    calcularTotalesGenerales();
    calcularTotales();
  };


  const saveInvitado = async (invitado) => {
    const method = invitado.InvitadoID ? 'PATCH' : 'POST';
    const url = invitado.InvitadoID ? `${API_URL}?InvitadoID=eq.${invitado.InvitadoID}` : API_URL;

    await fetch(url, {
      method,
      headers,
      body: JSON.stringify(invitado),
    });
    fetchInvitados();
    form.reset();
  };

  const deleteInvitado = async (id) => {
    await fetch(`${API_URL}?InvitadoID=eq.${id}`, {
      method: 'DELETE',
      headers,
    });
    fetchInvitados();
  };

  // Manejar envío del formulario
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const invitado = {
      InvitadoID: form.id.value || null,
      Familia: form.familia.value,
      Adultos: Number(form.adultos.value),
      Ninios: Number(form.ninios.value),
      AdultosConfirmados: Number(form.adultosConfirmados.value),
      NiniosConfirmados: Number(form.niniosConfirmados.value),
      bAsiste: false,
      bResponde: false,
    };

    saveInvitado(invitado);
    calcularTotalesGenerales();
    calcularTotales();
  });

  // Manejar edición y eliminación
  tbody.addEventListener('click', (e) => {
    if (e.target.classList.contains('edit')) {
      const row = e.target.closest('tr');
      form.id.value = row.children[0].textContent;
      form.familia.value = row.children[1].textContent;
      form.adultos.value = row.children[2].textContent;
      form.adultosConfirmados.value = row.children[3].textContent;
      form.ninios.value = row.children[4].textContent;
      form.niniosConfirmados.value = row.children[5].textContent;
    } else if (e.target.classList.contains('delete')) {
      const id = e.target.dataset.id;
      if (confirm('¿Seguro que deseas eliminar este invitado?')) {
        deleteInvitado(id);
      }
    }
    calcularTotalesGenerales();
    calcularTotales();
  });

  // Manejar filtros
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      fetchInvitados(filter);
    });
  });

  document.getElementById('exportar-excel').addEventListener('click', function() {
    const table = document.querySelector('table');
    const wb = XLSX.utils.table_to_book(table, { sheet: "Invitados" });
    XLSX.writeFile(wb, 'invitados.xlsx');
  });
  
  document.getElementById('limpiar-formulario').addEventListener('click', () => {
    const form = document.getElementById('invitado-form');
    form.reset(); // Limpia todos los campos del formulario
  });
  
  // Cargar todos los invitados al inicio
  fetchInvitados();
});
