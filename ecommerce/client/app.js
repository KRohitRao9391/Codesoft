async function loadProducts(){
  const res = await fetch('/api/products');
  const data = await res.json();
  const container = document.getElementById('products');
  container.innerHTML = '';
  data.forEach(p=>{
    const el = document.createElement('div');
    el.className = 'card';
    el.innerHTML = `<img src="${p.image}" alt="${p.title}"><h3>${escape(p.title)}</h3><p>${escape(p.description)}</p><div class="price">$${p.price.toFixed(2)}</div><p><button data-id="${p.id}" class="add">Add to cart</button></p>`;
    container.appendChild(el);
  });
  document.querySelectorAll('.add').forEach(b=> b.addEventListener('click', addToCart));
}

function escape(s){ return String(s).replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

function getCart(){ return JSON.parse(localStorage.getItem('cart')||'[]'); }
function setCart(c){ localStorage.setItem('cart', JSON.stringify(c)); updateCartCount(); }

function addToCart(e){
  const id = e.target.dataset.id;
  const cart = getCart();
  const found = cart.find(x=>x.id===id);
  if(found) found.qty++;
  else cart.push({ id, qty:1 });
  setCart(cart);
  alert('Added to cart');
}

function updateCartCount(){
  const count = getCart().reduce((s,i)=> s+i.qty, 0);
  document.getElementById('cartCount').textContent = count;
}

loadProducts();
updateCartCount();
