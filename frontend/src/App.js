import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { loginUser, registerUser, getAllClothing, addClothingItem, getOutfitSuggestions } from './api';
import './App.css';

function Auth({ setUser }) {
    const [isLogin, setIsLogin] = useState(true);
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const handleAction = async () => {
        try {
            const res = isLogin ? await loginUser(form) : await registerUser(form);
            if (isLogin) {
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', JSON.stringify(res.data.user));
                setUser(res.data.user);
            } else { setIsLogin(true); }
        } catch (err) { alert("Error: " + err.response.data.message); }
    };
    return (
        <div className="container card" style={{maxWidth:'400px', marginTop:'50px'}}>
            <h2>{isLogin ? 'Login' : 'Signup'}</h2>
            {!isLogin && <input className="form-group" placeholder="Name" onChange={e => setForm({...form, name: e.target.value})} />}
            <input className="form-group" placeholder="Email" onChange={e => setForm({...form, email: e.target.value})} />
            <input className="form-group" type="password" placeholder="Password" onChange={e => setForm({...form, password: e.target.value})} />
            <button className="btn" onClick={handleAction}>{isLogin ? 'Login' : 'Signup'}</button>
            <p onClick={() => setIsLogin(!isLogin)} style={{cursor:'pointer', marginTop:'10px'}}>
                {isLogin ? "Need an account? Signup" : "Have an account? Login"}
            </p>
        </div>
    );
}

function Wardrobe() {
    const [items, setItems] = useState([]);
    useEffect(() => { getAllClothing().then(res => setItems(res.data.items)); }, []);
    return (
        <div className="container">
            <h2 className="page-title">My Wardrobe</h2>
            <div className="grid">
                {items.map(i => (
                    <div key={i.id} className="item-card">
                        <img src={i.image_url} alt={i.name} />
                        <div className="content"><h4>{i.name}</h4><p>{i.category} • {i.color_primary}</p></div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function App() {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
    const logout = () => { localStorage.clear(); setUser(null); };
    return (
        <Router>
            <nav className="navbar">
                <h2>AI Wardrobe</h2>
                {user && <div className="nav-links">
                    <Link to="/">Wardrobe</Link><Link to="/add">Add</Link>
                    <button className="btn btn-danger" onClick={logout}>Logout</button>
                </div>}
            </nav>
            <Routes>
                {!user ? <Route path="*" element={<Auth setUser={setUser} />} /> : (
                    <>
                        <Route path="/" element={<Wardrobe />} />
                        <Route path="/add" element={/* Add same form logic as before but calling new API */} />
                    </>
                )}
            </Routes>
        </Router>
    );
}