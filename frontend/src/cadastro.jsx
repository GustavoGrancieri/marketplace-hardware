import "./cadastro.css";



function Cadastro() {



  const voltarHome = () => {

    window.location.href = "/";

  };



  const cadastrar = () => {

    alert("Usuário cadastrado com sucesso!");

    window.location.href = "/";

  };



  return (

    <div className="cadastro-container">



      <div className="cadastro-card">



        <h1>👤 Cadastro de Usuário</h1>



        <input

          type="text"

          placeholder="Nome Completo"

        />



        <input

          type="text"

          placeholder="CPF"

        />



        <input

          type="email"

          placeholder="E-mail"

        />



        <input

          type="tel"

          placeholder="Telefone"

        />



        <input

          type="password"

          placeholder="Senha"

        />



        <div className="cadastro-botoes">



          <button

            className="voltar-btn"

            onClick={voltarHome}

          >

            Voltar

          </button>



          <button

            className="cadastrar-btn"

            onClick={cadastrar}

          >

            Cadastrar

          </button>



        </div>



      </div>



    </div>

  );

}



export default Cadastro; 


