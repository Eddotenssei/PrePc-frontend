// Constants & elements
const cardContainer = document.getElementById('cardContainer');
const buttons = document.querySelectorAll('.category-buttons button');
const API_BASE = 'http://localhost:5000';
const logoutBtn = document.getElementById('logoutBtn');
const adminPanel = document.getElementById('adminPanel');
const signupBtn = document.getElementById('signupBtn');
const signinBtn = document.getElementById('signinBtn');
const adminBtn = document.getElementById('adminBtn');

// JWT helpers
function isLoggedIn() {
  const token = localStorage.getItem('token');
  if (!token) return false;
  try {
    const decoded = jwt_decode(token);
    const now = Date.now() / 1000;
    return decoded.exp > now;
  } catch {
    return false;
  }
}

function isUserAdmin() {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    const decoded = jwt_decode(token);
    return decoded.isAdmin === true;
  } catch (err) {
    console.error("Token decoding failed", err);
    return false;
  }
}

// Update UI based on auth status
function updateAuthUI() {
  const loggedIn = isLoggedIn();

  if (loggedIn) {
    if (signupBtn) signupBtn.style.display = 'none';
    if (signinBtn) signinBtn.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'inline-block';

    if (isUserAdmin()) {
      if (adminPanel) adminPanel.style.display = 'block';
      if (adminBtn) adminBtn.style.display = 'inline-block';
    } else {
      if (adminPanel) adminPanel.style.display = 'none';
      if (adminBtn) adminBtn.style.display = 'none';
    }
  } else {
    if (signupBtn) signupBtn.style.display = 'inline-block';
    if (signinBtn) signinBtn.style.display = 'inline-block';
    if (logoutBtn) logoutBtn.style.display = 'none';
    if (adminPanel) adminPanel.style.display = 'none';
    if (adminBtn) adminBtn.style.display = 'none';
  }
}

// Logout handler
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    alert('Logged out successfully');
    updateAuthUI();
    window.location.href = 'index.html';
  });
}

updateAuthUI();

// Category button click handlers
buttons.forEach(button => {
  button.addEventListener('click', () => {
    buttons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    const part = button.getAttribute('data-part');
    fetchParts(part);
  });
});

// Fetch parts from API
async function fetchParts(part) {
  cardContainer.innerHTML = '<p class="loading-text"><i class="fas fa-spinner fa-spin"></i> იტვირთება...</p>';
  try {
    const res = await fetch(`${API_BASE}/${part}`);
    if (!res.ok) throw new Error('შეცდომა მონაცემების მიღებისას');
    const data = await res.json();
    renderCards(data, part);
  } catch (err) {
    cardContainer.innerHTML = `<p class="loading-text" style="color:red;"><i class="fas fa-exclamation-circle"></i> ${err.message}</p>`;
  }
}

// Render product cards
function renderCards(parts, partType) {
  cardContainer.innerHTML = '';

  if (!parts.length) {
    cardContainer.innerHTML = '<p class="loading-text"><i class="fas fa-info-circle"></i> მონაცემები არ მოიძებნა.</p>';
    return;
  }

  parts.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card';

    const img = document.createElement('img');
    img.className = 'card-img';
    img.src = item.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image';
    img.alt = item.name || 'Product Image';
    card.appendChild(img);

    const cardContent = document.createElement('div');
    cardContent.className = 'card-content';

    const title = document.createElement('h3');
    title.className = 'card-title';
    title.textContent = item.name || item.model || item.brand || 'Unnamed';
    cardContent.appendChild(title);

    const details = document.createElement('div');
    details.className = 'card-details';
    details.innerHTML = getDetailsHTML(item, partType);
    cardContent.appendChild(details);

    const price = document.createElement('div');
    price.className = 'card-price';
    price.textContent = `$${item.price?.toFixed(2) || '0.00'}`;
    cardContent.appendChild(price);

    const addToWishlistBtn = document.createElement('button');
    addToWishlistBtn.className = 'add-to-wishlist';
    addToWishlistBtn.innerHTML = '<i class="fas fa-cart-plus"></i> Wishlist-ში დამატება';
    addToWishlistBtn.addEventListener('click', () => addToWishlist(item, partType));
    cardContent.appendChild(addToWishlistBtn);

    card.appendChild(cardContent);
    cardContainer.appendChild(card);
  });
}

// Add item to wishlist
async function addToWishlist(item, category) {
  if (!isLoggedIn()) {
    alert('გთხოვთ, ჩართეთ სისტემა Wishlist-ში ნივთების დასამატებლად.');
    window.location.href = '/login.html';
    return;
  }

  const token = localStorage.getItem('token');
  const wishlistItem = {
    id: `${category}-${item.id || item._id || crypto.randomUUID()}`,
    name: item.name || item.model || 'Unnamed',
    price: item.price || 0,
    category,
    image: item.imageUrl
  };

  try {
    const res = await fetch(`${API_BASE}/wishlist`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(wishlistItem)
    });

    if (!res.ok) {
      if (res.status === 409) throw new Error('ეს ნივთი უკვე დაემატებულია Wishlist-ში');
      throw new Error('დამატება ვერ მოხერხდა');
    }

    alert('ნივთი წარმატებით დაემატა Wishlist-ში');
    showNotification(`${wishlistItem.name} დაემატა Wishlist-ში`);
  } catch (err) {
    alert(err.message);
  }
}

// Show notification popup
function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'cart-notification';
  notification.innerHTML = `<i class="fas fa-check-circle"></i><span>${message}</span>`;
  document.body.appendChild(notification);

  setTimeout(() => notification.classList.add('show'), 10);
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => document.body.removeChild(notification), 300);
  }, 3000);
}

// Details HTML by category (unchanged)
function getDetailsHTML(item, type) {
  switch(type) {
    case 'processors':
      return `
        <p><strong>Cores:</strong> ${item.cores || '-'}</p>
        <p><strong>Threads:</strong> ${item.threads || '-'}</p>
        <p><strong>Base Clock:</strong> ${item.baseClock || '-'}</p>
        ${item.boostClock ? `<p><strong>Boost Clock:</strong> ${item.boostClock}</p>` : ''}
      `;
    case 'gpus':
      return `
        <p><strong>Chipset:</strong> ${item.chipset || '-'}</p>
        <p><strong>მეხსიერება:</strong> ${item.memorySize || '-'} GB ${item.memoryType || ''}</p>
        ${item.coreClock ? `<p><strong>Clock:</strong> ${item.coreClock} / ${item.boostClock || ''}</p>` : ''}
      `;
    case 'rams':
      return `
        <p><strong>Capacity:</strong> ${item.capacity || '-'}</p>
        <p><strong>Speed:</strong> ${item.speed || '-'}</p>
        <p><strong>Type:</strong> ${item.type || '-'}</p>
      `;
    case 'motherboards':
      return `
        <p><strong>Chipset:</strong> ${item.chipset || '-'}</p>
        <p><strong>Socket:</strong> ${item.socket || '-'}</p>
        <p><strong>Form Factor:</strong> ${item.formFactor || '-'}</p>
      `;
    case 'psus':
      return `
        <p><strong>Wattage:</strong> ${item.wattage || '-'}W</p>
        <p><strong>Efficiency:</strong> ${item.efficiencyRating || '-'}</p>
        <p><strong>Modular:</strong> ${item.modular ? 'დიახ' : 'არა'}</p>
      `;
    case 'storages':
      return `
        <p><strong>Type:</strong> ${item.type || '-'}</p>
        <p><strong>Capacity:</strong> ${item.capacity || '-'} GB</p>
        <p><strong>Interface:</strong> ${item.interface || '-'}</p>
      `;
    case 'cases':
      return `
        <p><strong>Brand:</strong> ${item.brand || '-'}</p>
        <p><strong>Color:</strong> ${item.color || '-'}</p>
        <p><strong>Windowed:</strong> ${item.windowed ? 'დიახ' : 'არა'}</p>
      `;
    case 'cpu-coolers':
      return `
        <p><strong>Brand:</strong> ${item.brand || '-'}</p>
        <p><strong>Type:</strong> ${item.type || '-'}</p>
        ${item.fanSize ? `<p><strong>Fan Size:</strong> ${item.fanSize}mm</p>` : ''}
      `;
    case 'case-fans':
      return `
        <p><strong>Size:</strong> ${item.size || '-'}mm</p>
        ${item.airflow ? `<p><strong>Airflow:</strong> ${item.airflow}</p>` : ''}
        <p><strong>RGB:</strong> ${item.rgb ? 'დიახ' : 'არა'}</p>
      `;
    case 'operating-systems':
      return `
        <p><strong>Version:</strong> ${item.version || '-'}</p>
        ${item.architecture ? `<p><strong>Architecture:</strong> ${item.architecture}</p>` : ''}
        <p><strong>License:</strong> ${item.licenseType || '-'}</p>
      `;
    default:
      return `<p>დეტალები არ არის</p>`;
  }
}


fetchParts('processors');
