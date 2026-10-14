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
        res = await registerUser({ name: form.name, email: form.email, password: form.password });
      }
      
      // Auto login on successful register or login
      if (res.data && res.data.token && res.data.user) {
        onLoginSuccess(res.data.user, res.data.token);
      } else {
        alert('Account created! Please log in.');
        setIsLogin(true);
      }
    } catch (err) {
      console.error('Auth Error Details:', err);
      // Display the EXACT server error message
      const serverMsg = err.response?.data?.message || err.response?.data?.error;
      const errorText = serverMsg || (err.message ? `Connection Error: ${err.message}` : 'Authentication failed. Please try again.');
      setError(errorText);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '420px', marginTop: '3rem' }}>
      <div className="card">
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#c084fc' }}>
          {isLogin ? '🔐 Login' : '📝 Create Account'}
        </h2>

        {error && (
          <div className="error-msg" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', padding: '0.8rem', borderRadius: '10px', marginBottom: '1rem', fontSize: '0.9rem', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Name"
                required
              />
            </div>
          )}
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="Email"
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="Password"
              required
            />
          </div>

          <button type="submit" className="btn" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
            {loading ? 'Please wait...' : isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.9rem', color: '#94a3b8' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span
            style={{ color: '#c084fc', fontWeight: 700, cursor: 'pointer' }}
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </span>
        </p>
      </div>
    </div>
  );
}