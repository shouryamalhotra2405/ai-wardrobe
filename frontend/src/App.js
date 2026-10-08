import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { loginUser, registerUser, getAllClothing, addClothingItem, deleteClothingItem, getOutfitSuggestions } from './api';
import './App.css';

// ── Navbar Component ──
function Navbar({ user, onLogout }) {
  const location = useLocation();
  const isActive = (path) => location.pathname === path ? { background: 'rgba(255,255,255,0.25)', color: '#fff' } : {};

  return (
    <nav className="navbar">
      <h2>👔 AI Wardrobe</h2>
      {user && (
        <div className="nav-links">
          <Link to="/" style={isActive('/')}>My Wardrobe</Link>
          <Link to="/add" style={isActive('/add')}>Add Clothes</Link>
          <Link to="/suggest" style={isActive('/suggest')}>Get Outfit</Link>
          <button onClick={onLogout} className="btn btn-danger" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', marginLeft: '0.5rem' }}>
            Logout ({user.name})
          </button>
        </div>
      )}
    </nav>
  );
}

// ── Auth Page (Login / Register) ──
function AuthPage({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let res;
      if (isLogin) {
        res = await loginUser({ email: form.email, password: form.password });
      } else {
        res = await registerUser(form);
      }
      if (isLogin) {
        onLoginSuccess(res.data.user, res.data.token);
      } else {
        alert('✅ Account created successfully! Please log in.');
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please check your inputs.');
    }
    setLoading(false);
  };

  return (
    <div className="container" style={{ maxWidth: '420px', marginTop: '3rem' }}>
      <div className="card">
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#4f46e5' }}>
          {isLogin ? '🔐 User Login' : '📝 Create Account'}
        </h2>

        {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Shourya Malhotra" required />
            </div>
          )}
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" required />
          </div>

          <button type="submit" className="btn" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
            {loading ? 'Processing...' : isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.9rem', color: '#64748b' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span style={{ color: '#4f46e5', fontWeight: 700, cursor: 'pointer' }} onClick={() => { setIsLogin(!isLogin); setError(''); }}>
            {isLogin ? 'Sign Up' : 'Login'}
          </span>
        </p>
      </div>
    </div>
  );
}

// ── 1. My Wardrobe Page ──
function WardrobePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadItems(); }, []);

  const loadItems = async () => {
    setLoading(true);
    try {
      const res = await getAllClothing();
      setItems(res.data.items || []);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this item from your private wardrobe?')) {
      await deleteClothingItem(id);
      loadItems();
    }
  };

  return (
    <div className="container">
      <h2 className="page-title">👔 Private Wardrobe <span style={{ color: '#7c3aed' }}>({items.length} Items)</span></h2>

      {loading ? (
        <div className="card empty-state">Loading your permanent wardrobe...</div>
      ) : items.length === 0 ? (
        <div className="card empty-state">
          <span className="emoji">👕</span>
          <h3>Your wardrobe is empty</h3>
          <p style={{ marginTop: '0.5rem' }}>Add your clothes to save them permanently in the cloud!</p>
          <br />
          <Link to="/add"><button className="btn">➕ Add First Item</button></Link>
        </div>
      ) : (
        <div className="grid">
          {items.map(item => (
            <div key={item.id} className="item-card">
              <img src={item.image_url || 'https://via.placeholder.com/300x300?text=No+Image'} alt={item.name} />
              <div className="content">
                <h4>{item.name}</h4>
                <p className="meta">{item.color_primary} • {item.occasion}</p>
                <span className="badge badge-top">{item.category}</span>
                <br /><br />
                <button onClick={() => handleDelete(item.id)} className="btn btn-danger" style={{ padding: '0.4rem 0.9rem', fontSize: '0.8rem' }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── 2. Add Clothing Page ──
function AddClothingPage() {
  const [form, setForm] = useState({ name: '', category: 'top', color_primary: 'black', occasion: 'casual', season: 'all-season' });
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    try {
      const formData = new FormData();
      Object.keys(form).forEach(key => formData.append(key, form[key]));
      if (file) formData.append('image', file);

      await addClothingItem(formData);
      setMsg('✅ Clothing saved permanently to cloud database!');
      setTimeout(() => navigate('/'), 1200);
    } catch (err) {
      setMsg('❌ Failed to add item. Check connection.');
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
            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Navy Shirt" required />
          </div>
          <div className="form-group">
            <label>Category *</label>
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              <option value="top">👕 Top (Shirt / T-Shirt / Hoodie)</option>
              <option value="bottom">👖 Bottom (Jeans / Pants)</option>
              <option value="shoes">👟 Shoes / Footwear</option>
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
            </select>
          </div>
          <div className="form-group">
            <label>Occasion</label>
            <select value={form.occasion} onChange={e => setForm({ ...form, occasion: e.target.value })}>
              <option value="casual">Casual</option>
              <option value="formal">Formal / Office</option>
              <option value="party">Party / Event</option>
              <option value="sports">Sports / Gym</option>
            </select>
          </div>
          <div className="form-group">
            <label>Photo (Uploaded to Permanent Cloud)</label>
            <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} />
          </div>
          <button type="submit" className="btn" disabled={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
            {loading ? 'Uploading to Cloud...' : '✨ Add to Permanent Wardrobe'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── 3. AI Suggestion Page ──
function SuggestionPage() {
  const [occasion, setOccasion] = useState('casual');
  const [season, setSeason] = useState('all-season');
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSuggest = async () => {
    setLoading(true);
    try {
      const res = await getOutfitSuggestions(occasion, season);
      setOutfits(res.data.suggestions || []);
    } catch (err) { console.error(err); }
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
            </select>
          </div>
        </div>
        <button onClick={handleSuggest} className="btn" disabled={loading} style={{ marginTop: '1rem' }}>
          {loading ? 'Thinking...' : '✨ Get Personal Outfit Suggestions'}
        </button>
      </div>

      {outfits.length === 0 && !loading && (
        <div className="card empty-state">
          <span className="emoji">👗</span>
          <p>Select an occasion and click the button to get styled by AI!</p>
        </div>
      )}

      {outfits.map((o, idx) => (
        <div key={idx} className="card outfit-box">
          <h3 style={{ color: '#4f46e5' }}>Outfit #{idx + 1} (Score: {o.score}/100)</h3>
          <p>👕 <b>Top:</b> {o.top?.name} ({o.top?.color_primary})</p>
          <p>👖 <b>Bottom:</b> {o.bottom?.name} ({o.bottom?.color_primary})</p>
          {o.shoes && <p>👟 <b>Shoes:</b> {o.shoes.name} ({o.shoes.color_primary})</p>}
        </div>
      ))}
    </div>
  );
}

// ── Main App Router ──
export default function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handleLoginSuccess = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <Router>
      <Navbar user={user} onLogout={handleLogout} />
      <Routes>
        {!user ? (
          <>
            <Route path="/auth" element={<AuthPage onLoginSuccess={handleLoginSuccess} />} />
            <Route path="*" element={<Navigate to="/auth" replace />} />
          </>
        ) : (
          <>
            <Route path="/" element={<WardrobePage />} />
            <Route path="/add" element={<AddClothingPage />} />
            <Route path="/suggest" element={<SuggestionPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
    </Router>
  );
}