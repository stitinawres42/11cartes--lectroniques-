const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const db = new Database('mydb.sqlite');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

db.exec(`CREATE TABLE IF NOT EXISTS cartes (
    id INTEGER PRIMARY KEY,
    nom TEXT,
    description TEXT,
    prix REAL,
    stock INTEGER
)`);

app.post('/cartes', (req, res) => {
    console.log('POST reçu:', req.body);
    const { id, nom, description, prix, stock } = req.body;
    try {
        db.prepare('INSERT INTO cartes (id, nom, description, prix, stock) VALUES (?, ?, ?, ?, ?)').run(id, nom, description, prix, stock);
        res.json({ message: 'Carte ajoutée' });
    } catch(e) {
        res.status(400).json({ error: 'Erreur: ID existe déjà' });
    }
});

app.get('/cartes', (req, res) => {
    const cartes = db.prepare('SELECT * FROM cartes').all();
    res.json(cartes);
});

app.put('/cartes/:id', (req, res) => {
    const { nom, description, prix, stock } = req.body;
    const result = db.prepare('UPDATE cartes SET nom = ?, description = ?, prix = ?, stock = ? WHERE id = ?').run(nom, description, prix, stock, req.params.id);
    res.json({ message: 'Modifiée' });
});

app.delete('/cartes/:id', (req, res) => {
    db.prepare('DELETE FROM cartes WHERE id = ?').run(req.params.id);
    res.json({ message: 'Supprimée' });
});

app.listen(3000, () => console.log('Serveur sur http://localhost:3000'));