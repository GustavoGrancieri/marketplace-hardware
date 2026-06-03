import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./style.css";
import "./cadastro.css";

function App() {
  const [busca, setBusca] = useState("");
  const [carrinho, setCarrinho] = useState([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("Todos");
  
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  const [pagina, setPagina] = useState("home");
  
  const [usuarioLogado, setUsuarioLogado] = useState(localStorage.getItem("usuarioLogado") || null);
  const [fotoPerfil, setFotoPerfil] = useState(null);
  
  const [anuncios, setAnuncios] = useState([]);
  
  const [toast, setToast] = useState("");
  const [modalTroca, setModalTroca] = useState({ aberto: false, itemDesejado: null });
  const [modalAvaliacao, setModalAvaliacao] = useState({ aberto: false, vendedor: null, nota: 0 });

  const [atualizarNotas, setAtualizarNotas] = useState(0);

  const [novoProduto, setNovoProduto] = useState({ titulo: "", preco: "", categoria: "GPU" });
  const [formLogin, setFormLogin] = useState({ email: "", senha: "" });
  const [formCadastro, setFormCadastro] = useState({ nome: "", cpf: "", email: "", telefone: "", senha: "" });

  const mostrarNotificacao = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 4000);
  };

  useEffect(() => {
    if (usuarioLogado) {
      fetch(`/api/usuarios/foto/${usuarioLogado}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data && data.foto_perfil) setFotoPerfil(data.foto_perfil);
        })
        .catch(() => console.log("Rota de foto off."));
    } else {
      setFotoPerfil(null);
    }
  }, [usuarioLogado]);

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

  const meusAnuncios = anuncios.filter(item => item.autor === usuarioLogado);

  const publicarAnuncio = async () => {
    if (!novoProduto.titulo || !novoProduto.preco) {
      mostrarNotificacao("⚠️ Preencha todos os campos do anúncio.");
      return;
    }
    try {
      const resposta = await fetch('/api/anuncios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...novoProduto, emoji: "📦", autor: usuarioLogado })
      });
      if (resposta.ok) {
        const anuncioSalvo = await resposta.json();
        setAnuncios([anuncioSalvo, ...anuncios]);
        setMostrarFormulario(false);
        setNovoProduto({ titulo: "", preco: "", categoria: "GPU" });
        mostrarNotificacao("✅ Produto publicado com sucesso!");
      } else {
        mostrarNotificacao("❌ Erro ao salvar anúncio.");
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
        localStorage.setItem("usuarioLogado", dados.usuario); 
        if(dados.foto_perfil) setFotoPerfil(dados.foto_perfil);
        setPagina("home");
        setFormLogin({ email: "", senha: "" });
        setMenuAberto(false);
        mostrarNotificacao(`👋 Bem-vindo de volta, ${dados.usuario}!`);
      } else {
        mostrarNotificacao("❌ E-mail ou senha incorretos!");
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
        mostrarNotificacao("✅ Cadastrado com sucesso! Agora faça o login.");
        setPagina("login");
        setFormCadastro({ nome: "", cpf: "", email: "", telefone: "", senha: "" });
        setMenuAberto(false);
      } else {
        mostrarNotificacao("❌ Erro ao realizar o cadastro.");
      }
    } catch (error) {
      console.error("Erro no cadastro", error);
    }
  };

  const handleUploadFoto = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result;
        setFotoPerfil(base64String);
        mostrarNotificacao("📸 Salvando foto de perfil...");

        try {
          await fetch('/api/usuarios/foto', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario: usuarioLogado, foto_perfil: base64String })
          });
          mostrarNotificacao("✅ Foto atualizada!");
        } catch(err) {
          mostrarNotificacao("⚠️ Foto alterada localmente.");
        }
      };
      reader.readAsDataURL(file);
    }
    setMenuAberto(false);
  };

  const abrirModalTroca = (item) => {
    if (!usuarioLogado) { mostrarNotificacao("⚠️ Faça login para propor trocas."); setPagina("login"); return; }
    if (item.autor === usuarioLogado) { mostrarNotificacao("⚠️ Você não pode trocar com você mesmo!"); return; }
    setModalTroca({ aberto: true, itemDesejado: item });
  };

  const confirmarTroca = (meuItemOferecido) => {
    mostrarNotificacao(`🔄 Proposta enviada para ${modalTroca.itemDesejado.autor}!`);
    setModalTroca({ aberto: false, itemDesejado: null });
  };

  const abrirAvaliacao = (autor) => {
    if (!usuarioLogado) { mostrarNotificacao("⚠️ Faça login para avaliar."); return; }
    if (autor === usuarioLogado) { mostrarNotificacao("⚠️ Você não pode se autoavaliar!"); return; }
    setModalAvaliacao({ aberto: true, vendedor: autor, nota: 0 });
  };

  // AGORA SALVA UMA LISTA DE NOTAS PARA CALCULAR A MÉDIA
  const confirmarAvaliacao = () => {
    if (modalAvaliacao.nota === 0) { mostrarNotificacao("⚠️ Selecione pelo menos uma estrela."); return; }
    
    const vendedor = modalAvaliacao.vendedor;
    const notaDada = modalAvaliacao.nota;
    
    // Puxa o histórico de notas desse vendedor (se não tiver, cria uma lista vazia)
    let historicoNotas = JSON.parse(localStorage.getItem("avaliacoes_" + vendedor) || "[]");
    
    // Adiciona a nova nota na lista
    historicoNotas.push(notaDada);
    
    // Salva a lista inteira de volta
    localStorage.setItem("avaliacoes_" + vendedor, JSON.stringify(historicoNotas));
    
    setAtualizarNotas(atualizarNotas + 1); // Força atualização da tela
    
    mostrarNotificacao(`⭐ Avaliação de ${notaDada} estrelas enviada para ${vendedor}!`);
    setModalAvaliacao({ aberto: false, vendedor: null, nota: 0 });
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
          <div className="cadastro-botoes" style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
            <button onClick={() => setPagina("home")} style={{ flex: 1, padding: '10px', background: '#33364f', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Voltar</button>
            <button onClick={fazerLogin} style={{ flex: 1, padding: '10px', background: '#00d2ff', color: '#000', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Entrar</button>
          </div>
        </div>
      </div>
    );
  }

  if (pagina === "meus_anuncios") {
    return (
      <div className="app">
        <nav className="navbar">
          <h2 onClick={() => setPagina("home")} style={{cursor: 'pointer'}}>⚡ Hardhub</h2>
          <button onClick={() => setPagina("home")} style={{ padding: '8px 16px', background: '#33364f', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Voltar ao Catálogo</button>
        </nav>
        <header className="hero" style={{ padding: '40px 20px', minHeight: 'auto' }}>
          <div className="overlay">
            <h1>📦 Meus Anúncios</h1>
            <p>Gerencie os hardwares que você está vendendo ou trocando</p>
          </div>
        </header>
        <section className="catalogo">
          {meusAnuncios.length > 0 ? (
            meusAnuncios.map((item) => (
              <div className="card" key={item.id} style={{ border: '2px solid #00d2ff' }}>
                <div className="badge">{item.categoria}</div>
                <div className="icon">{item.emoji || "📦"}</div>
                <h3>{item.titulo}</h3>
                <p className="preco">R$ {Number(item.preco).toFixed(2)}</p>
                <button style={{ width: '100%', padding: '10px', background: '#ff4c4c', border: 'none', color: '#fff', fontWeight: 'bold', cursor: 'pointer', borderRadius: '5px' }}>
                  🗑️ Remover Anúncio
                </button>
              </div>
            ))
          ) : (
            <p style={{ textAlign: 'center', width: '100%', color: '#888' }}>Você ainda não publicou nenhum anúncio.</p>
          )}
        </section>
      </div>
    );
  }

  return (
    <div className="app">
      
      {toast && (
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', background: '#00d2ff', color: '#000', padding: '15px 20px', borderRadius: '8px', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', zIndex: 10000 }}>
          {toast}
        </div>
      )}

      {modalAvaliacao.aberto && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: '#1a1d2e', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '400px', border: '1px solid #00d2ff', textAlign: 'center' }}>
            <h2 style={{ color: '#fff', marginBottom: '10px' }}>Avaliar Vendedor</h2>
            <p style={{ color: '#aaa', marginBottom: '20px' }}>Como foi a sua experiência com <strong>{modalAvaliacao.vendedor || 'este usuário'}</strong>?</p>
            
            <div style={{ fontSize: '40px', cursor: 'pointer', marginBottom: '20px', userSelect: 'none' }}>
              {[1, 2, 3, 4, 5].map((estrela) => (
                <span 
                  key={estrela} 
                  onClick={() => setModalAvaliacao({ ...modalAvaliacao, nota: estrela })}
                  style={{ color: modalAvaliacao.nota >= estrela ? '#ffd700' : '#444' }}
                >
                  ★
                </span>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setModalAvaliacao({ aberto: false, vendedor: null, nota: 0 })} style={{ flex: 1, padding: '12px', background: '#33364f', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Cancelar</button>
              <button onClick={confirmarAvaliacao} style={{ flex: 1, padding: '12px', background: '#00d2ff', color: '#000', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Enviar Avaliação</button>
            </div>
          </div>
        </div>
      )}

      {modalTroca.aberto && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: '#1a1d2e', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '500px', border: '1px solid #00d2ff' }}>
            <h2 style={{ color: '#00d2ff', marginBottom: '10px' }}>🔄 Propor Troca</h2>
            <p style={{ color: '#ccc', marginBottom: '20px' }}>Você deseja o item: <strong>{modalTroca.itemDesejado.titulo}</strong></p>
            <h4 style={{ marginBottom: '15px' }}>Selecione um item seu para oferecer:</h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto' }}>
              {meusAnuncios.length > 0 ? (
                meusAnuncios.map(meuItem => (
                  <button key={meuItem.id} onClick={() => confirmarTroca(meuItem)} style={{ background: '#33364f', color: '#fff', border: '1px solid #555', padding: '15px', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{meuItem.titulo}</span>
                    <span style={{ color: '#00d2ff', fontWeight: 'bold' }}>Oferecer</span>
                  </button>
                ))
              ) : (
                <div style={{ padding: '20px', background: '#33364f', borderRadius: '8px', textAlign: 'center', color: '#ff4c4c' }}>
                  <p>Você não possui nenhum produto anunciado.</p>
                </div>
              )}
            </div>
            <button onClick={() => setModalTroca({ aberto: false, itemDesejado: null })} style={{ width: '100%', padding: '12px', marginTop: '20px', background: 'transparent', color: '#aaa', border: '1px solid #aaa', borderRadius: '5px', cursor: 'pointer' }}>Cancelar</button>
          </div>
        </div>
      )}

      <input type="file" id="uploadFoto" accept="image/*" style={{ display: 'none' }} onChange={handleUploadFoto} />

      <nav className="navbar">
        <h2 onClick={() => setPagina("home")} style={{cursor: 'pointer'}}>⚡ Hardhub</h2>
        <div className="nav-right">
          
          <button className="anunciar-btn" onClick={() => usuarioLogado ? setMostrarFormulario(!mostrarFormulario) : setPagina("login")}>
            + Anunciar
          </button>

          <div className="user-menu" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '10px' }}>
            {usuarioLogado && (
              <img 
                src={fotoPerfil || `https://ui-avatars.com/api/?name=${usuarioLogado}&background=random`} 
                alt="Perfil" 
                style={{ width: '35px', height: '35px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #00d2ff' }} 
              />
            )}

            <span className="user-icon" onClick={() => setMenuAberto(!menuAberto)} style={{ cursor: 'pointer', userSelect: 'none', fontSize: '14px', fontWeight: 'normal' }}>
              {!usuarioLogado && "👤"} {usuarioLogado ? usuarioLogado : "Visitante"} ▾
            </span>

            {menuAberto && (
              <div className="dropdown" style={{ position: 'absolute', top: '100%', right: '0', marginTop: '15px', background: '#1a1d2e', padding: '15px', borderRadius: '8px', boxShadow: '0px 8px 16px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '170px', zIndex: 1000, border: '1px solid #33364f' }}>
                {!usuarioLogado ? (
                  <>
                    <a href="#" onClick={(e) => { e.preventDefault(); setPagina("login"); setMenuAberto(false); }} style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold' }}>Entrar</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); setPagina("cadastro"); setMenuAberto(false); }} style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold' }}>Cadastrar</a>
                  </>
                ) : (
                  <>
                    <a href="#" onClick={(e) => { e.preventDefault(); document.getElementById('uploadFoto').click(); }} style={{ color: '#fff', textDecoration: 'none', fontSize: '14px' }}>📷 Mudar Foto</a>
                    <hr style={{ borderColor: '#33364f', width: '100%' }} />
                    <a href="#" onClick={(e) => { e.preventDefault(); setPagina("meus_anuncios"); setMenuAberto(false); }} style={{ color: '#00d2ff', textDecoration: 'none', fontWeight: 'bold' }}>Meus Anúncios</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); setUsuarioLogado(null); localStorage.removeItem("usuarioLogado"); setFotoPerfil(null); setMenuAberto(false); setMostrarFormulario(false); }} style={{ color: '#ff4c4c', textDecoration: 'none', fontWeight: 'bold' }}>Sair</a>
                  </>
                )}
              </div>
            )}
          </div>
          <div className="carrinho">🛒 {carrinho.length}</div>
        </div>
      </nav>

      <header className="hero">
        <div className="overlay">
          <h1>⚡ Hardhub</h1>
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
            <option>GPU</option><option>CPU</option><option>Placa-Mãe</option><option>Memória</option><option>Fonte</option><option>Armazenamento</option><option>Refrigeração</option>
          </select>
          <button onClick={publicarAnuncio} style={{ width: '100%', padding: '10px', marginTop: '10px', background: '#00d2ff', border: 'none', color: '#000', fontWeight: 'bold', cursor: 'pointer', borderRadius: '5px' }}>Publicar Produto</button>
        </section>
      )}

      <section className="filtros">
        <button onClick={() => setCategoriaSelecionada("Todos")}>Todos</button>
        <button onClick={() => setCategoriaSelecionada("GPU")}>GPU</button>
        <button onClick={() => setCategoriaSelecionada("CPU")}>CPU</button>
        <button onClick={() => setCategoriaSelecionada("Placa-Mãe")}>Placa-Mãe</button>
        <button onClick={() => setCategoriaSelecionada("Memória")}>Memória</button>
        <button onClick={() => setCategoriaSelecionada("Armazenamento")}>SSD</button>
      </section>

      <section className="catalogo">
        {filtrados.map((item) => {
          
          // CÁLCULO DA MÉDIA
          const historicoNotas = JSON.parse(localStorage.getItem("avaliacoes_" + item.autor) || "[]");
          let textoAvaliacao = "⭐ Sem avaliações (Avaliar)";
          
          if (historicoNotas.length > 0) {
            const soma = historicoNotas.reduce((acc, curr) => acc + curr, 0);
            const media = (soma / historicoNotas.length).toFixed(1);
            textoAvaliacao = `⭐ ${media} (${historicoNotas.length} avaliações) - Avaliar`;
          }

          return (
            <div className="card" key={item.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div className="badge">{item.categoria}</div>
              <div className="icon">{item.emoji || "📦"}</div>
              
              <h3>{item.titulo}</h3>
              <p className="preco">R$ {Number(item.preco).toFixed(2)}</p>
              
              <div style={{ fontSize: '13px', color: '#aaa', marginTop: '5px', borderTop: '1px solid #333', paddingTop: '10px', paddingBottom: '10px' }}>
                <div>Vendedor(a): <strong style={{ color: '#fff' }}>{item.autor || 'Usuário Desconhecido'}</strong></div>
                <div style={{ cursor: 'pointer', color: '#ffd700', marginTop: '4px', fontWeight: 'bold' }} onClick={() => abrirAvaliacao(item.autor)}>
                  {textoAvaliacao}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '5px', marginTop: 'auto' }}>
                <button onClick={() => { setCarrinho([...carrinho, item]); mostrarNotificacao("🛒 Adicionado ao carrinho!"); }} style={{ flex: 1, padding: '8px', fontSize: '12px' }}>🛒 Comprar</button>
                <button onClick={() => abrirModalTroca(item)} style={{ flex: 1, padding: '8px', fontSize: '12px', background: '#ffaa00', color: '#000', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>🔄 Trocar</button>
              </div>
            </div>
          );
        })}
      </section>

      <footer>Hardhub © 2026</footer>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
