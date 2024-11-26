const API_URL = 'https://ivoetjclejmrvnbrqryg.supabase.co/rest/v1/Invitados';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2b2V0amNsZWptcnZuYnJxcnlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI1NDE4NDQsImV4cCI6MjA0ODExNzg0NH0.6u9I8ssWkbFveR5RFjv-MeIFVOOz9S6KgHEFmtLOpec'; // Reemplaza con tu clave
const CLIENT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2b2V0amNsZWptcnZuYnJxcnlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI1NDE4NDQsImV4cCI6MjA0ODExNzg0NH0.6u9I8ssWkbFveR5RFjv-MeIFVOOz9S6KgHEFmtLOpec'; // Reemplaza con tu clave

document.addEventListener('DOMContentLoaded', () => {
  const familiaSelect = document.getElementById('familia');
  const formDetails = document.getElementById('details');
  const adultosSpan = document.getElementById('adultos');
  const niniosSpan = document.getElementById('ninios');
  const adultosConfirmadosInput = document.getElementById('adultosConfirmados');
  const niniosConfirmadosInput = document.getElementById('niniosConfirmados');
  const noAsistiraCheckbox = document.getElementById('noAsistira');
  
  // Cargar familias al select
  async function loadFamilias() {
    try {
      const response = await fetch(`${API_URL}?select=*`, {
        headers: {
          'apikey': API_KEY,
          'Authorization': `Bearer ${CLIENT_KEY}`
        }
      });
      if (!response.ok) throw new Error('Error al cargar familias');
      
      const data = await response.json();
      data.forEach(familia => {
        const option = document.createElement('option');
        option.value = familia.InvitadoID;
        option.textContent = familia.Familia;
        option.dataset.adultos = familia.Adultos;
        option.dataset.ninios = familia.Ninios;
        familiaSelect.appendChild(option);
      });
    } catch (error) {
      console.error('Error:', error);
    }
  }
  
  // Mostrar detalles al seleccionar familia
  familiaSelect.addEventListener('change', () => {
    const selectedOption = familiaSelect.options[familiaSelect.selectedIndex];
    if (selectedOption.value) {
      formDetails.style.display = 'block';
      adultosSpan.textContent = selectedOption.dataset.adultos;
      niniosSpan.textContent = selectedOption.dataset.ninios;
      adultosConfirmadosInput.max = selectedOption.dataset.adultos;
      niniosConfirmadosInput.max = selectedOption.dataset.ninios;
    } else {
      formDetails.style.display = 'none';
    }
  });
  
  // Manejar envío del formulario
  document.getElementById('attendance-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const familiaID = familiaSelect.value;
    const adultosConfirmados = noAsistiraCheckbox.checked ? 0 : Number(adultosConfirmadosInput.value);
    const niniosConfirmados = noAsistiraCheckbox.checked ? 0 : Number(niniosConfirmadosInput.value);
    const bAsiste = !noAsistiraCheckbox.checked;
    
    try {
      const response = await fetch(`${API_URL}?id=eq.${familiaID}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY,
          'Authorization': `Bearer ${CLIENT_KEY}`
        },
        body: JSON.stringify({
          bAsiste,
          AdultosConfirmados: adultosConfirmados,
          NiniosConfirmados: niniosConfirmados,
          bResponde: true
        })
      });
      if (!response.ok) throw new Error('Error al guardar la confirmación');
      
      alert('Confirmación guardada con éxito');
    } catch (error) {
      console.error('Error:', error);
      alert('Hubo un error al guardar la confirmación');
    }
  });
  
  loadFamilias();
});
