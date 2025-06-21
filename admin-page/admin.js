const API_BASE = 'http://localhost:5000';

const processorForm = document.getElementById('processorForm');

processorForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(processorForm);
  const data = {};

  for (let [key, value] of formData.entries()) {
    if (value !== '') {
      data[key] = isNaN(value) || key === "imageUrl" || key === "name" || key.includes("Clock")
        ? value
        : Number(value);
    }
  }

  try {
    const res = await fetch(`${API_BASE}/processors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      throw new Error('Failed to add processor.');
    }

    alert('Processor successfully added!');
    processorForm.reset();
  } catch (err) {
    alert(err.message);
  }
});
