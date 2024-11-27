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
      const response = await fetch(`${API_URL}?bResponde=eq.FALSE&order=Familia.asc&select=*`, {
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
      adultosConfirmadosInput.disabled = false;
      niniosConfirmadosInput.disabled = Number(niniosSpan.textContent) == 0;
    } else {
      formDetails.style.display = 'none';
    }
  });

  // Deshabilitar campos cuando se marca "No podré asistir"
  noAsistiraCheckbox.addEventListener('change', () => {
    const isChecked = noAsistiraCheckbox.checked;
  
    adultosConfirmadosInput.required = !isChecked;
    niniosConfirmadosInput.required = !isChecked;
  
    adultosConfirmadosInput.disabled = isChecked;
    niniosConfirmadosInput.disabled = isChecked || Number(niniosSpan.textContent) == 0;
  
    if (isChecked) {
      adultosConfirmadosInput.value = '';
      niniosConfirmadosInput.value = '';
    }
  });

  // Validar límites al salir del input
  function validateMaxInput(input, max) {
    if (Number(input.value) > max) {
      input.value = max; 
    }
  }

  adultosConfirmadosInput.addEventListener('blur', () => {
    validateMaxInput(
      adultosConfirmadosInput,
      Number(adultosSpan.textContent)
    );
  });

  niniosConfirmadosInput.addEventListener('blur', () => {
    validateMaxInput(
      niniosConfirmadosInput,
      Number(niniosSpan.textContent)
    );
  });

  // Manejar envío del formulario
  document.getElementById('attendance-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const familiaID = familiaSelect.value; // ID de la familia seleccionada
    const adultosConfirmados = noAsistiraCheckbox.checked ? 0 : Number(adultosConfirmadosInput.value);
    const niniosConfirmados = noAsistiraCheckbox.checked ? 0 : Number(niniosConfirmadosInput.value);
    const bAsiste = !noAsistiraCheckbox.checked;
  
    try {
      const response = await fetch(`${API_URL}?InvitadoID=eq.${familiaID}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY,
          'Authorization': `Bearer ${CLIENT_KEY}`,
          'Prefer': 'return=minimal' // Reduce el peso de la respuesta
        },
        body: JSON.stringify({
          bAsiste,
          AdultosConfirmados: adultosConfirmados,
          NiniosConfirmados: niniosConfirmados,
          bResponde: true
        })
      });
  
      document.getElementById('seleccion').style.display = 'none';
      document.getElementById('details').style.display = 'none';
      document.getElementById('thank-you-message').style.display = 'block';
    } catch (error) {
      console.error('Error:', error);
    }
  });

  document.getElementById('new-confirmation').addEventListener('click', () => {
    document.getElementById('thank-you-message').style.display = 'none';
    document.getElementById('attendance-form').reset();
    document.getElementById('details').style.display = 'none';
    document.getElementById('seleccion').style.display = 'block';
  });

  loadFamilias();
});
