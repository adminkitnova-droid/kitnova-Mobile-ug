import { useState } from 'react'
import { supabase } from '../services/supabaseClient'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const handleReset = async () => {
    if (password.length < 6) {
      setMsg('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) {
      setMsg('Error: ' + error.message)
    } else {
      setMsg('Password updated! Redirecting to login...')
      setTimeout(() => window.location.pathname = '/', 2000)
    }
  }

  return (
    <div style={{padding:40, maxWidth:400, margin:'0 auto', fontFamily:'sans-serif'}}>
      <h2>Reset Password - KITNOVA</h2>
      <input 
        type="password" 
        placeholder="New password" 
        value={password}
        onChange={e => setPassword(e.target.value)}
        style={{width:'100%', padding:12, margin:'12px 0', borderRadius:8, border:'1px solid #ccc'}}
      />
      <button 
        onClick={handleReset} 
        disabled={loading}
        style={{width:'100%', padding:12, background:'#0a192f', color:'#d4af37', border:'none', borderRadius:8, fontWeight:'bold'}}
      >
        {loading ? 'Updating...' : 'Update Password'}
      </button>
      <p>{msg}</p>
    </div>
  )
}
