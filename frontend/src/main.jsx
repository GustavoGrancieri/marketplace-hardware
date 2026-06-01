import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./style.css";
import "./cadastro.css";

function App() {
  const [busca, setBusca] = useState("");
  const [carrinho, setCarrinho] = useState([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("Todos");
  
  // Controles de interface
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  const [pagina, setPagina] = useState("home");
  
  // A MÁGICA DA MEMÓRIA: Agora ele tenta buscar do bloquinho de notas do navegador antes de dizer que é null
  const [usuarioLogado, setUsuarioLogado] = useState(localStorage.getItem("usuarioLogado") || null);

  const [anuncios, setAnuncios] = useState([]);

  const [novoProduto, setNovoProduto] = useState({
    titulo: "",
    preco: "",
    categoria: "GPU"
  });

  const [formLogin, setFormLogin] = useState({ email: "", senha: "" });
  const [formCadastro, setFormCadastro] = useState({ nome: "", cpf: "", email: "", telefone: "", senha: "" });

  useEffect(() => {
    fetch('/api/anuncios')
      .then(res => res.json())
      .then(data => setAnuncios(data))
      .catch(erro => console.error("Erro ao buscar anúncios:", erro));
  }, []);

  const filtrados = anuncios.filter((item) => {
    const buscaMatch = item.titulo.toLowerCase().includes(busca.toLowerCase()) || item.categoria.toLowerCase().includes(busca.toLowerCase());
    const categoriaMatch = categoriaSelecionada === "Todos" || item.categoria.toLowerCase() === categoriaSelecionada.toLowerCase();
    return buscaMatch && categoriaMatch;
  });

  const valorTotal = anuncios.reduce((acc, item) => acc + Number(item.preco), 0);

  const publicarAnuncio = async () => {
    if (!novoProduto.titulo || !novoProduto.preco) {
      alert("Preencha todos os campos do anúncio.");
      return;
    }
    try {
      const resposta = await fetch('/api/anuncios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...novoProduto, emoji: "📦" })
      });
      if (resposta.ok) {
        const anuncioSalvo = await resposta.json();
        setAnuncios([anuncioSalvo, ...anuncios]);
        setMostrarFormulario(false);
        setNovoProduto({ titulo: "", preco: "", categoria: "GPU" });
        alert("Anúncio publicado com sucesso!");
      } else {
        alert("Erro ao salvar anúncio no banco de dados.");
      }
    } catch (error) {
      console.error("Erro na API", error);
    }
  };

  const fazerLogin = async () => {
    try {
      const resposta = await fetch('/api/usuarios/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formLogin)
      });
      if (resposta.ok) {
        const dados = await resposta.json();
        setUsuarioLogado(dados.usuario);
        
        // SALVA NO BLOQUINHO DE NOTAS DO NAVEGADOR
        localStorage.setItem("usuarioLogado", dados.usuario); 
        
        setPagina("home");
        setFormLogin({ email: "", senha: "" });
        setMenuAberto(false);
      } else {
        alert("E-mail ou senha incorretos!");
      }
    } catch (error) {
      console.error("Erro no login", error);
    }
  };

  const fazerCadastro = async () => {
    try {
      const resposta = await fetch('/api/usuarios/cadastro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formCadastro)
      });
      if (resposta.ok) {
        alert("Cadastrado com sucesso! Agora faça o login.");
        setPagina("login");
        setFormCadastro({ nome: "", cpf: "", email: "", telefone: "", senha: "" });
        setMenuAberto(false);
      } else {
        alert("Erro ao realizar o cadastro.");
      }
    } catch (error) {
      console.error("Erro no cadastro", error);
    }
  };

  const handleAnunciarClick = () => {
    if (!usuarioLogado) {
      alert("Você precisa fazer login para anunciar um produto.");
      setPagina("login");
    } else {
      setMostrarFormulario(!mostrarFormulario);
    }
  };

  if (pagina === "cadastro") {
    return (
      <div className="cadastro-container">
        <div className="cadastro-card">
          <h1>👤 Cadastro</h1>
          <input placeholder="Nome Completo" value={formCadastro.nome} onChange={(e) => setFormCadastro({ ...formCadastro, nome: e.target.value })} />
          <input placeholder="CPF" value={formCadastro.cpf} onChange={(e) => setFormCadastro({ ...formCadastro, cpf: e.target.value })} />
          <input placeholder="E-mail" type="email" value={formCadastro.email} onChange={(e) => setFormCadastro({ ...formCadastro, email: e.target.value })} />
          <input placeholder="Telefone" value={formCadastro.telefone} onChange={(e) => setFormCadastro({ ...formCadastro, telefone: e.target.value })} />
          <input type="password" placeholder="Senha" value={formCadastro.senha} onChange={(e) => setFormCadastro({ ...formCadastro, senha: e.target.value })} />
          
          {/* BOTÕES ESTILIZADOS */}
          <div className="cadastro-botoes" style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
            <button onClick={() => setPagina("home")} style={{ flex: 1, padding: '10px', background: '#33364f', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Voltar</button>
            <button onClick={fazerCadastro} style={{ flex: 1, padding: '10px', background: '#00d2ff', color: '#000', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Cadastrar</button>
          </div>
        </div>
      </div>
    );
  }

  if (pagina === "login") {
    return (
      <div className="cadastro-container">
        <div className="cadastro-card">
          <h1>🔐 Login</h1>
          <input placeholder="E-mail" type="email" value={formLogin.email} onChange={(e) => setFormLogin({ ...formLogin, email: e.target.value })} />
          <input type="password" placeholder="Senha" value={formLogin.senha} onChange={(e) => setFormLogin({ ...formLogin, senha: e.target.value })} />
          
          {/* BOTÕES ESTILIZADOS */}
          <div className="cadastro-botoes" style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
            <button onClick={() => setPagina("home")} style={{ flex: 1, padding: '10px', background: '#33364f', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Voltar</button>
            <button onClick={fazerLogin} style={{ flex: 1, padding: '10px', background: '#00d2ff', color: '#000', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Entrar</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <nav className="navbar">
        <h2>⚡ Hardware Hub</h2>
        <div className="nav-right">
          
          <button className="anunciar-btn" onClick={handleAnunciarClick}>
            + Anunciar
          </button>

          <div className="user-menu" style={{ position: 'relative' }}>
            <span 
              className="user-icon" 
              onClick={() => setMenuAberto(!menuAberto)}
              style={{ cursor: 'pointer', userSelect: 'none', fontSize: '14px', fontWeight: 'normal' }}
            >
              👤 {usuarioLogado ? usuarioLogado : "Visitante"} ▾
            </span>

            {menuAberto && (
              <div 
                className="dropdown" 
                style={{ position: 'absolute', top: '100%', right: '0', marginTop: '10px', background: '#1a1d2e', padding: '15px', borderRadius: '8px', boxShadow: '0px 8px 16px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '150px', zIndex: 1000, border: '1px solid #33364f' }}
              >
                {!usuarioLogado ? (
                  <>
                    <a href="#" onClick={(e) => { e.preventDefault(); setPagina("login"); setMenuAberto(false); }} style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold' }}>Entrar</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); setPagina("cadastro"); setMenuAberto(false); }} style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold' }}>Cadastrar</a>
                  </>
                ) : (
                  <a href="#" onClick={(e) => { 
                    e.preventDefault(); 
                    setUsuarioLogado(null); 
                    // APAGA DO BLOQUINHO NA HORA DE SAIR
                    localStorage.removeItem("usuarioLogado"); 
                    setMenuAberto(false); 
                    setMostrarFormulario(false); 
                  }} style={{ color: '#ff4c4c', textDecoration: 'none', fontWeight: 'bold' }}>Sair</a>
                )}
              </div>
            )}
          </div>

          <div className="carrinho">
            🛒 {carrinho.length}
          </div>
        </div>
      </nav>

      <header className="hero">
        <div className="overlay">
          <h1>⚡ Hardware Hub</h1>
          <p>Marketplace especializado em hardware e tecnologia</p>
          <input type="text" placeholder="Pesquisar produtos..." value={busca} onChange={(e) => setBusca(e.target.value)} />
        </div>
      </header>

      {mostrarFormulario && (
        <section className="formulario" style={{ background: '#1a1d2e', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
          <h2>Novo Anúncio</h2>
          <input placeholder="Título do produto" value={novoProduto.titulo} onChange={(e) => setNovoProduto({ ...novoProduto, titulo: e.target.value })} />
          <input type="number" placeholder="Preço" value={novoProduto.preco} onChange={(e) => setNovoProduto({ ...novoProduto, preco: e.target.value })} />
          <select value={novoProduto.categoria} onChange={(e) => setNovoProduto({ ...novoProduto, categoria: e.target.value })}>
            <option>GPU</option>
            <option>CPU</option>
            <option>Placa-Mãe</option>
            <option>Memória</option>
            <option>Fonte</option>
            <option>Armazenamento</option>
            <option>Refrigeração</option>
          </select>
          <button onClick={publicarAnuncio} style={{ width: '100%', padding: '10px', marginTop: '10px', background: '#00d2ff', border: 'none', color: '#000', fontWeight: 'bold', cursor: 'pointer', borderRadius: '5px' }}>
            Publicar Produto
          </button>
        </section>
      )}

      <section className="stats">
        <div className="stat-card"><h2>{anuncios.length}</h2><span>Produtos</span></div>
        <div className="stat-card"><h2>R$ {valorTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</h2><span>Valor Total</span></div>
        <div className="stat-card"><h2>{new Set(anuncios.map((a) => a.categoria)).size}</h2><span>Categorias</span></div>
      </section>

      <section className="promo">🚨 PROMOÇÃO DA SEMANA • Até 40% OFF EM GPUs RTX 🚨</section>

      <section className="filtros">
        <button onClick={() => setCategoriaSelecionada("Todos")}>Todos</button>
        <button onClick={() => setCategoriaSelecionada("GPU")}>GPU</button>
        <button onClick={() => setCategoriaSelecionada("CPU")}>CPU</button>
        <button onClick={() => setCategoriaSelecionada("Placa-Mãe")}>Placa-Mãe</button>
        <button onClick={() => setCategoriaSelecionada("Memória")}>Memória</button>
        <button onClick={() => setCategoriaSelecionada("Fonte")}>Fonte</button>
        <button onClick={() => setCategoriaSelecionada("Armazenamento")}>SSD</button>
      </section>

      <section className="catalogo">
        {filtrados.map((item) => (
          <div className="card" key={item.id}>
            <div className="badge">{item.categoria}</div>
            <div className="icon">{item.emoji || "📦"}</div>
            <h3>{item.titulo}</h3>
            <p className="preco">R$ {Number(item.preco).toFixed(2)}</p>
            <button onClick={() => setCarrinho([...carrinho, item])}>🛒 Adicionar</button>
          </div>
        ))}
      </section>

      <footer>Hardware Hub © 2026</footer>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
