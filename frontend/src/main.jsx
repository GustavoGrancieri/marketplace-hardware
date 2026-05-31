import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'

function App() {
  const [anuncios, setAnuncios] = useState([])

  // Aqui o Front-end pede os dados para o Back-end
  useEffect(() => {
    fetch('/api/anuncios')
      .then(res => res.json())
      .then(data => setAnuncios(data))
      .catch(err => console.error("Erro ao buscar dados:", err))
  }, [])

  return (
    <div>
      <h1>Hardware Marketplace 💻</h1>
      <div style={{ display: 'flex', gap: '20px' }}>
        {anuncios.map(item => (
          <div key={item.id} style={{ background: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
            <h3>{item.titulo}</h3>
            <p style={{ color: '#007bff', fontWeight: 'bold' }}>R$ {item.preco.toFixed(2)}</p>
            <span style={{ fontSize: '12px', background: '#eee', padding: '5px', borderRadius: '4px' }}>{item.categoria}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
