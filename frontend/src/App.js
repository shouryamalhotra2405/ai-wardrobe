import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { addClothingItem, getAllClothing, deleteClothingItem, getOutfitSuggestions } from './api';
import './App.css';

// ── Navbar with active link highlight ──
function Navbar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path ? { background: 'rgba(255,255,255,0.25)', color: '#fff' } : {};

  return (
    <nav className="navbar">
      <h2>👔 AI Wardrobe</h2>
      <div className="nav-links">
        <Link to="/" style={isActive('/')}>My Wardrobe</Link>
        <Link to="/add" style={isActive('/add')}>Add Clothes</Link>
        <Link to="/suggest" style={isActive('/suggest')}>Get Outfit</Link>
      </div>
    </nav>
  );
}

// ── 1. MY WARDROBE PAGE ──
function WardrobePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoading(true);
    try {
      const data = await getAllClothing();
      setItems(data.items || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this item from your wardrobe?')) {
      await deleteClothingItem(id);
      loadItems();
    }
  };

  const getBadgeClass = (cat) => {
    if (cat === 'top') return 'badge badge-top';
    if (cat === 'bottom') return 'badge badge-bottom';
    if (cat === 'shoes') return 'badge badge-shoes';
    return 'badge badge-outerwear';
  };

  return (
    <div className="container">
      <h2 className="page-title">👔 My Wardrobe <span style={{ color: '#7c3aed' }}>({items.length} Items)</span></h2>

      {loading ? (
        <div className="card empty-state">Loading your clothes...</div>
      ) : items.length === 0 ? (
        <div className="card empty-state">
          <span className="emoji">👕</span>
          <h3>Your wardrobe is empty</h3>
          <p style={{ marginTop: '0.5rem' }}>Add your first clothing item to get AI outfit suggestions!</p>
          <br />
          <Link to="/add"><button className="btn">➕ Add First Item</button></Link>
        </div>
      ) : (
        <div className="grid">
          {items.map(item => (
            <div key={item.id} className="item-card">
              <img
                src={item.image_path ? `http://127.0.0.1:5000/${item.image_path}` : 'https://via.placeholder.com/300x300?text=No+Image'}
                alt={item.name}
              />
              <div className="content">
                <h4>{item.name}</h4>
                <p className="meta">{item.color_primary} • {item.occasion}</p>
                <span className={getBadgeClass(item.category)}>{item.category}</span>
                <br /><br />
                <button
                  onClick={() => handleDelete(item.id)}
                  className="btn btn-danger"
                  style={{ padding: '0.4rem 0.9rem', fontSize: '0.8rem' }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── 2. ADD CLOTHING PAGE ──
function AddClothingPage() {
  const [form, setForm] = useState({
    name: '',
    category: 'top',
    color_primary: 'black',
    occasion: 'casual',
    season: 'all-season'
  });
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    try {
      const formData = new FormData();
      Object.keys(form).forEach(key => formData.append(key, form[key]));
      if (file) formData.append('image', file);

      await addClothingItem(formData);
      setMsg('✅ Clothing item added successfully!');
      setForm({ name: '', category: 'top', color_primary: 'black', occasion: 'casual', season: 'all-season' });
      setFile(null);
    } catch (err) {
      setMsg('❌ Failed to add item. Is the backend running?');
    }
    setLoading(false);
  };

  return (
    <div className="container" style={{ maxWidth: '580px' }}>
      <h2 className="page-title">➕ Add New Clothes</h2>

      <div className="card">
        {msg && <div className="success-msg">{msg}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Clothing Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Navy Oxford Shirt"
              required
            />
          </div>

          <div className="form-group">
            <label>Category *</label>
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              <option value="top">👕 Top (Shirt / T-Shirt / Hoodie)</option>
              <option value="bottom">👖 Bottom (Jeans / Pants / Shorts)</option>
              <option value="shoes">👟 Shoes / Footwear</option>
              <option value="outerwear">🧥 Jacket / Outerwear</option>
            </select>
          </div>

          <div className="form-group">
            <label>Primary Color *</label>
            <select value={form.color_primary} onChange={e => setForm({ ...form, color_primary: e.target.value })}>
              <option value="black">Black</option>
              <option value="white">White</option>
              <option value="blue">Blue</option>
              <option value="navy">Navy</option>
              <option value="grey">Grey</option>
              <option value="red">Red</option>
              <option value="green">Green</option>
              <option value="beige">Beige</option>
              <option value="brown">Brown</option>
              <option value="pink">Pink</option>
              <option value="purple">Purple</option>
            </select>
          </div>

          <div className="form-group">
            <label>Occasion</label>
            <select value={form.occasion} onChange={e => setForm({ ...form, occasion: e.target.value })}>
              <option value="casual">Casual</option>
              <option value="formal">Formal / Office</option>
              <option value="party">Party / Night Out</option>
              <option value="sports">Sports / Gym</option>
              <option value="date">Date Night</option>
            </select>
          </div>

          <div className="form-group">
            <label>Season</label>
            <select value={form.season} onChange={e => setForm({ ...form, season: e.target.value })}>
              <option value="all-season">All Season</option>
              <option value="summer">Summer</option>
              <option value="winter">Winter</option>
              <option value="rainy">Rainy</option>
            </select>
          </div>

          <div className="form-group">
            <label>Photo (optional – AI detects color)</label>
            <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} />
          </div>

          <button type="submit" className="btn" disabled={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
            {loading ? 'Adding...' : '✨ Add to Wardrobe'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── 3. AI OUTFIT SUGGESTION PAGE ──
function SuggestionPage() {
  const [occasion, setOccasion] = useState('casual');
  const [season, setSeason] = useState('all-season');
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSuggest = async () => {
    setLoading(true);
    try {
      const res = await getOutfitSuggestions(occasion, season);
      setOutfits(res.suggestions || []);
    } catch (err) {
      console.error(err);
      setOutfits([]);
    }
    setLoading(false);
  };

  return (
    <div className="container">
      <h2 className="page-title">🤖 AI Outfit Stylist</h2>

      <div className="card">
        <div className="controls-row">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Occasion</label>
            <select value={occasion} onChange={e => setOccasion(e.target.value)}>
              <option value="casual">😎 Casual Outing</option>
              <option value="formal">💼 Formal / Office</option>
              <option value="party">🎉 Party / Event</option>
              <option value="date">❤️ Date Night</option>
              <option value="sports">🏃 Sports / Gym</option>
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Season / Weather</label>
            <select value={season} onChange={e => setSeason(e.target.value)}>
              <option value="all-season">🌤️ Pleasant / Regular</option>
              <option value="summer">☀️ Summer (Light)</option>
              <option value="winter">❄️ Winter (Layered)</option>
            </select>
          </div>
        </div>

        <button onClick={handleSuggest} className="btn" disabled={loading} style={{ marginTop: '1rem' }}>
          {loading ? 'Thinking...' : '✨ Get AI Outfit Suggestions'}
        </button>
      </div>

      {outfits.length === 0 && !loading && (
        <div className="card empty-state">
          <span className="emoji">👗</span>
          <p>Select an occasion and click the button to get styled by AI!</p>
          <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Tip: Add at least 1 top + 1 bottom + 1 shoes first.</p>
        </div>
      )}

      {outfits.map((o, idx) => (
        <div key={idx} className="card outfit-box">
          <div className="outfit-score">Score {o.score}/100</div>
          <h3 style={{ marginBottom: '0.75rem', color: '#4f46e5' }}>Outfit #{idx + 1}</h3>

          <div className="outfit-row">
            <div className="outfit-icon">👕</div>
            <div><b>Top:</b> {o.top?.name} <span style={{ color: '#64748b' }}>({o.top?.color_primary})</span></div>
          </div>
          <div className="outfit-row">
            <div className="outfit-icon">👖</div>
            <div><b>Bottom:</b> {o.bottom?.name} <span style={{ color: '#64748b' }}>({o.bottom?.color_primary})</span></div>
          </div>
          {o.shoes && (
            <div className="outfit-row">
              <div className="outfit-icon">👟</div>
              <div><b>Shoes:</b> {o.shoes.name} <span style={{ color: '#64748b' }}>({o.shoes.color_primary})</span></div>
            </div>
          )}
          {o.outerwear && (
            <div className="outfit-row">
              <div className="outfit-icon">🧥</div>
              <div><b>Outerwear:</b> {o.outerwear.name}</div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── MAIN APP ──
export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<WardrobePage />} />
        <Route path="/add" element={<AddClothingPage />} />
        <Route path="/suggest" element={<SuggestionPage />} />
      </Routes>
    </Router>
  );
}