document.getElementById('signinForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const submitBtn = document.getElementById('submitBtn');
  submitBtn.disabled = true;

  const credentials = {
    email: document.getElementById('email').value,
    password: document.getElementById('password').value,
  };

  try {
    const response = await fetch('http://localhost:5000/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (response.ok) {
      alert('Login successful!');
      localStorage.setItem('token', data.token); 
      window.location.href = '/';
    } else {
      alert(data.message || 'Login failed');
    }
  } catch (error) {
    alert('Network error. Please try again.');
  } finally {
    submitBtn.disabled = false;
  }
});
