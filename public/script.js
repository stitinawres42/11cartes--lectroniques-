function showToast(msg, isError = false) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.className = isError ? 'toast error show' : 'toast show';
    setTimeout(() => toast.classList.remove('show'), 3000);
}

async function addCard() {
    const id = document.getElementById('addId').value;
    const name = document.getElementById('addName').value;
    const description = document.getElementById('addDesc').value;
    const price = document.getElementById('addPrice').value;
    const stock = document.getElementById('addStock').value;

    if (!id || !name || !price || !stock) {
        showToast('Remplissez tous les champs', true);
        return;
    }

    const res = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name, description, price, stock })
    });
    const data = await res.json();
    showToast(data.message || data.error, !res.ok);
    if (res.ok) {
        document.getElementById('addId').value = '';
        document.getElementById('addName').value = '';
        document.getElementById('addDesc').value = '';
        document.getElementById('addPrice').value = '';
        document.getElementById('addStock').value = '';
        fetchCards();
    }
}

async function fetchCards() {
    const res = await fetch('/api/cards');
    const cards = await res.json();
    const tbody = document.getElementById('cardsBody');
    if (!cards.length) {
        tbody.innerHTML = '<tr><td colspan="7">Aucune carte</td></tr>';
        return;
    }
    tbody.innerHTML = cards.map(c => `
        <tr>
            <td>${c.id}</td>
            <td>${escapeHtml(c.name)}</td>
            <td>${escapeHtml(c.description || '')}</td>
            <td>${c.price} DT</td>
            <td>${c.stock}</td>
            <td class="${c.stock > 0 ? 'available' : 'out-of-stock'}">${c.stock > 0 ? '✅ Disponible' : '❌ Rupture'}</td>
            <td>
                <button class="btn-update" onclick="fillUpdateForm(${c.id})">Modifier</button>
                <button class="btn-delete" onclick="deleteCard(${c.id})">Supprimer</button>
            </td>
        </tr>
    `).join('');
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m] || m));
}

async function fillUpdateForm(id) {
    const res = await fetch('/api/cards/${id}');
    if (!res.ok) {
        showToast('Carte non trouvée', true);
        return;
    }
    const card = await res.json();
    document.getElementById('updateId').value = card.id;
    document.getElementById('updateName').value = card.name;
    document.getElementById('updateDesc').value = card.description || '';
    document.getElementById('updatePrice').value = card.price;
    document.getElementById('updateStock').value = card.stock;
    showToast('Modification carte ${id}');
}

async function updateCard() {
    const id = document.getElementById('updateId').value;
    const name = document.getElementById('updateName').value;
    const description = document.getElementById('updateDesc').value;
    const price = document.getElementById('updatePrice').value;
    const stock = document.getElementById('updateStock').value;

    if (!id) {
        showToast('ID requis', true);
        return;
    }

    const body = {};
    if (name) body.name = name;
    if (description) body.description = description;
    if (price) body.price = parseFloat(price);
    if (stock) body.stock = parseInt(stock);

    if (Object.keys(body).length === 0) {
        showToast('Au moins un champ à modifier', true);
        return;
    }

    const res = await fetch('/api/cards/${id}', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    const data = await res.json();
    showToast(data.message || data.error, !res.ok);
    if (res.ok) {
        document.getElementById('updateId').value = '';
        document.getElementById('updateName').value = '';
        document.getElementById('updateDesc').value = '';
        document.getElementById('updatePrice').value = '';
        document.getElementById('updateStock').value = '';
        fetchCards();
    }
}

async function deleteCard(id) {
    if (!confirm('Supprimer cette carte ?')) return;
    const res = await fetch('/api/cards/${id}', { method: 'DELETE' });
    const data = await res.json();
    showToast(data.message || data.error, !res.ok);
    if (res.ok) fetchCards();
}

async function deleteCardById() {
    const id = document.getElementById('deleteId').value;
    if (!id) {
        showToast('ID requis', true);
        return;
    }
    await deleteCard(parseInt(id));
    document.getElementById('deleteId').value = '';
}

fetchCards();
