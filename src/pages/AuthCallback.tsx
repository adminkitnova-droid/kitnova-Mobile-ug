import { useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'

export default function AuthCallback() {
  const [msg, setMsg] = useState('Verifying your recovery link...')

  useEffect(() => {
    const handle = async () => {
      try {
        const { data } = await supabase.auth.getSession()
        if (data.session) {
          setMsg('Verified! Redirecting...')
          setTimeout(() => window.location.pathname = '/reset-password', 1000)
          return
        }
        if (window.location.hash.includes('access_token')) {
          setMsg('Token found...')
          setTimeout(() => window.location.href = '/reset-password' + window.location.hash, 500)
          return
        }
        setMsg('Link verified, redirecting to reset...')
        setTimeout(() => window.location.pathname = '/reset-password', 1000)
      } catch (e) {
        console.error(e)
        setMsg('Error verifying link. Request a new one.')
      }
    }
    handle()
  }, [])

  return (
    <div style={{padding:40, textAlign:'center', fontFamily:'sans-serif'}}>
      <h2>KITNOVA</h2>
      <p>{msg}</p>
    </div>
  )
}
