document.getElementById('signupForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const submitBtn = document.getElementById('submitBtn');
  submitBtn.disabled = true;

  const formData = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    password: document.getElementById('password').value,
    gender: document.querySelector('input[name="gender"]:checked').value
  };

  try {
    const response = await fetch('http://localhost:5000/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const data = await response.json();

    if (response.ok) {
      alert('Account created successfully!');

      // Auto-login after sign-up
      const loginRes = await fetch('http://localhost:5000/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const loginData = await loginRes.json();

      if (loginRes.ok) {
        localStorage.setItem('token', loginData.token);
        window.location.href = '/';
      } else {
        alert('Login after sign-up failed. Please sign in manually.');
      }
    } else {
      alert(data.message || 'Registration failed');
    }
  } catch (error) {
    alert('Network error. Please try again.');
  } finally {
    submitBtn.disabled = false;
  }
});
