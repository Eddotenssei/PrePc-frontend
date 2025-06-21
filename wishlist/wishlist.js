const cardContainer = document.getElementById('cardContainer');
const API_BASE = 'http://localhost:5000';

let totalPrice = 0;

async function fetchWishlist(showLoading = true) {
  if (showLoading) {
    cardContainer.innerHTML = '<p class="loading-text"><i class="fas fa-spinner fa-spin"></i> იტვირთება...</p>';
  }

  try {
    const res = await fetch(`${API_BASE}/wishlist`);
    if (!res.ok) throw new Error('Error fetching wishlist');

    const items = await res.json();
    renderWishlistCards(items);
  } catch (err) {
    cardContainer.innerHTML = `<p class="loading-text" style="color:red;"><i class="fas fa-exclamation-circle"></i> ${err.message}</p>`;
  }
}


function renderWishlistCards(items) {
  cardContainer.innerHTML = '';
  totalPrice = 0;

  if (!items.length) {
    cardContainer.innerHTML = '<p class="loading-text"><i class="fas fa-info-circle"></i> Wishlist is empty.</p>';
    updateTotalPrice(0); 
    return;
  }

  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card';

    const img = document.createElement('img');
    img.className = 'card-img';
    img.src = item.image || 'https://via.placeholder.com/300x200?text=No+Image';
    img.alt = item.name || 'Product Image';
    card.appendChild(img);

    const cardContent = document.createElement('div');
    cardContent.className = 'card-content';

    const title = document.createElement('h3');
    title.className = 'card-title';
    title.textContent = item.name || 'Unnamed';
    cardContent.appendChild(title);

    const price = document.createElement('div');
    price.className = 'card-price';
    price.textContent = `$${item.price?.toFixed(2) || '0.00'}`;
    cardContent.appendChild(price);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-from-wishlist';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => deleteFromWishlist(item._id));
    cardContent.appendChild(deleteBtn);


    card.appendChild(cardContent);
    cardContainer.appendChild(card);

    updateTotalPrice(item.price || 0);
  });
}

async function deleteFromWishlist(id) {
  try {
    const res = await fetch(`${API_BASE}/wishlist/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) throw new Error('Failed to delete item');
    fetchWishlist(false);
  } catch (err) {
    console.error(err.message);
  }
}



function updateTotalPrice(amount) {
  totalPrice += amount;
  const totalEl = document.getElementById('totalPrice');
  if (totalEl) totalEl.textContent = totalPrice.toFixed(2);
}

document.addEventListener('DOMContentLoaded', () => fetchWishlist());

