import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { loginUser, registerUser, getAllClothing, addClothingItem, deleteClothingItem, getOutfitSuggestions } from './api';
import './App.css';

// ── OPTION 6: CINEMATIC BOKEH LIGHT PARTICLES ──
function BokehBackground() {
  const particles = useMemo(() => {
    const colors = [
      'rgba(99, 102, 241, ',   // Indigo
      'rgba(168, 85, 247, ',  // Purple
      'rgba(236, 72, 153, ',  // Pink
      'rgba(56, 189, 248, ',  // Cyan
      'rgba(192, 132, 252, '  // Violet
    ];

    return Array.from({ length: 18 }).map((_, i) => {
      const size = Math.floor(Math.random() * 120) + 40;
      const left = Math.floor(Math.random() * 100);
      const colorPrefix = colors[i % colors.length];
      const opacity = (Math.random() * 0.3 + 0.12).toFixed(2);
      const blur = Math.floor(Math.random() * 35) + 25;
      const duration = Math.floor(Math.random() * 14) + 11;
      const delay = (Math.random() * -22).toFixed(1);

      return {
        id: i,
        style: {
          width: `${size}px`,
          height: `${size}px`,
          left: `${left}vw`,
          backgroundColor: `${colorPrefix}${opacity})`,
          boxShadow: `0 0 ${size / 2}px ${colorPrefix}${opacity})`,
          filter: `blur(${blur}px)`,
          animationDuration: `${duration}s`,
          animationDelay: `${delay}s`,
          '--particle-opacity': opacity
        }
      };
    });
  }, []);

  return (
    <div className="bokeh-container">
      {particles.map(p => (
        <div key={p.id} className="bokeh-particle" style={p.style} />
      ))}
    </div>
  );
}

// ── Navbar ──
function Navbar({ user, onLogout }) {
  const location = useLocation();
  const isActive = (path) => location.pathname === path ? { background: 'rgba(255,255,255,0.2)', color: '#fff' } : {};

  return (
    <nav className="navbar">
      <h2>👔 AI Wardrobe</h2>
      {user && (
        <div className="nav-links">
          <Link to="/" style={isActive('/')}>My Wardrobe</Link>
          <Link to="/add" style={isActive('/add')}>Add Clothes</Link>
          <Link to="/suggest" style={isActive('/suggest')}>Get Outfit</Link>
          <button onClick={onLogout} className="btn btn-danger" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
            Logout ({user.name})
          </button>
        </div>
      )}
    </nav>
  );
}

// ── Auth Page ──
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
      if (isLogin) {
        const res = await loginUser({ email: form.email, password: form.password });
        onLoginSuccess(res.data.user, res.data.token);
      } else {
        await registerUser(form);
        alert('✅ Account created! Please log in.');
        setIsLogin(true);
        setForm({ name: '', email: form.email, password: '' });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed.');
    }
    setLoading(false);
  };

  return (
    <div className="container" style={{ maxWidth: '420px', marginTop: '3rem' }}>
      <div className="card">
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#c084fc' }}>
          {isLogin ? '🔐 Login' : '📝 Create Account'}
        </h2>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label>Name</label>
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Name" required />
            </div>
          )}
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email" required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Password" required />
          </div>
          <button type="submit" className="btn" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Please wait...' : isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.9rem', color: '#94a3b8' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span style={{ color: '#c084fc', fontWeight: 700, cursor: 'pointer' }} onClick={() => { setIsLogin(!isLogin); setError(''); }}>
            {isLogin ? 'Sign Up' : 'Login'}
          </span>
        </p>
      </div>
    </div>
  );
}

// ── Wardrobe Page ──
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
    if (window.confirm('Delete this item?')) {
      await deleteClothingItem(id);
      loadItems();
    }
  };

  return (
    <div className="container">
      <h2 className="page-title">👔 Private Wardrobe <span style={{ color: '#c084fc' }}>({items.length} Items)</span></h2>

      {loading ? (
        <div className="card empty-state">Loading...</div>
      ) : items.length === 0 ? (
        <div className="card empty-state">
          <span className="emoji">👕</span>
          <h3>Your wardrobe is empty</h3>
          <br />
          <Link to="/add"><button className="btn">➕ Add First Item</button></Link>
        </div>
      ) : (
        <div className="grid">
          {items.map(item => (
            <div key={item.id} className="item-card">
              <img
                src={item.image_url || 'https://via.placeholder.com/300x300?text=No+Photo'}
                alt={item.name}
                onError={(e) => { e.target.src = 'https://via.placeholder.com/300x300?text=No+Photo'; }}
              />
              <div className="content">
                <h4>{item.name}</h4>
                <p className="meta">{item.color_primary} • {item.occasion}</p>
                <span className="badge">{item.category}</span>
                <br /><br />
                <button onClick={() => handleDelete(item.id)} className="btn btn-danger" style={{ padding: '0.4rem 0.9rem', fontSize: '0.8rem' }}>
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

// ── Add Clothing Page ──
function AddClothingPage() {
  const [form, setForm] = useState({ name: '', category: 'top', color_primary: 'black', occasion: 'casual' });
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
      setMsg('✅ Saved permanently to cloud!');
      setTimeout(() => navigate('/'), 1000);
    } catch (err) {
      setMsg('❌ Failed to add item.');
    }
    setLoading(false);
  };

  return (
    <div className="container" style={{ maxWidth: '580px' }}>
      <h2 className="page-title">➕ Add New Clothes</h2>
      <div className="card">
        {msg && <div className={msg.includes('✅') ? 'success-msg' : 'error-msg'}>{msg}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name *</label>
            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Name" required />
          </div>
          <div className="form-group">
            <label>Category *</label>
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              <option value="top">Top</option>
              <option value="bottom">Bottom</option>
              <option value="shoes">Shoes</option>
            </select>
          </div>
          <div className="form-group">
            <label>Color *</label>
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
              <option value="formal">Formal</option>
              <option value="party">Party</option>
              <option value="sports">Sports</option>
            </select>
          </div>
          <div className="form-group">
            <label>Photo</label>
            <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} />
          </div>
          <button type="submit" className="btn" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Uploading...' : '✨ Add to Wardrobe'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Suggestion Page ──
function SuggestionPage() {
  const [occasion, setOccasion] = useState('casual');
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSuggest = async () => {
    setLoading(true);
    try {
      const res = await getOutfitSuggestions(occasion);
      setOutfits(res.data.suggestions || []);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  return (
    <div className="container">
      <h2 className="page-title">🤖 AI Outfit Stylist</h2>
      <div className="card">
        <div className="form-group">
          <label>Occasion</label>
          <select value={occasion} onChange={e => setOccasion(e.target.value)}>
            <option value="casual">Casual</option>
            <option value="formal">Formal</option>
            <option value="party">Party</option>
          </select>
        </div>
        <button onClick={handleSuggest} className="btn" disabled={loading}>
          {loading ? 'Thinking...' : '✨ Get Outfit Suggestions'}
        </button>
      </div>

      {outfits.map((o, idx) => (
        <div key={idx} className="card outfit-box">
          <h3 style={{ color: '#c084fc' }}>Outfit #{idx + 1}</h3>
          <p>👕 Top: {o.top?.name} ({o.top?.color_primary})</p>
          <p>👖 Bottom: {o.bottom?.name} ({o.bottom?.color_primary})</p>
          {o.shoes && <p>👟 Shoes: {o.shoes.name} ({o.shoes.color_primary})</p>}
        </div>
      ))}
    </div>
  );
}

// ── Main App ──
export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLoginSuccess = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <Router>
      <BokehBackground />
      <Navbar user={user} onLogout={handleLogout} />
      <Routes>
        {!user ? (
          <Route path="*" element={<AuthPage onLoginSuccess={handleLoginSuccess} />} />
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