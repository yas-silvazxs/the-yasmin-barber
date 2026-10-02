(function () {
  const tabLogin = document.getElementById('tabLogin');
  const tabCadastro = document.getElementById('tabCadastro');
  const formLogin = document.getElementById('formLogin');
  const formCadastro = document.getElementById('formCadastro');
  const switchLine = document.getElementById('switchLine');
  const goCadastro = document.getElementById('goCadastro');

  if (!tabLogin || !formLogin) return;

  function showLogin() {
    tabLogin.classList.add('active');
    tabCadastro.classList.remove('active');
    formLogin.classList.remove('hidden');
    formCadastro.classList.add('hidden');
    switchLine.innerHTML = 'Ainda não tem conta? <button class="link-btn" id="goCadastro" type="button">Cadastre-se</button>';
    const btnGoCad = document.getElementById('goCadastro');
    if (btnGoCad) btnGoCad.addEventListener('click', showCadastro);
  }

  function showCadastro() {
    tabCadastro.classList.add('active');
    tabLogin.classList.remove('active');
    formCadastro.classList.remove('hidden');
    formLogin.classList.add('hidden');
    switchLine.innerHTML = 'Já tem conta? <button class="link-btn" id="goLogin" type="button">Entrar</button>';
    const btnGoLog = document.getElementById('goLogin');
    if (btnGoLog) btnGoLog.addEventListener('click', showLogin);
  }

  tabLogin.addEventListener('click', showLogin);
  tabCadastro.addEventListener('click', showCadastro);
  if (goCadastro) goCadastro.addEventListener('click', showCadastro);

  function setError(id, msg) {
    const el = document.getElementById(id);
    if (el) el.textContent = msg || '';
  }

  function isValidEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  function isValidPhone(v) {
    return v.replace(/\D/g, '').length >= 10;
  }

  // ---- 1. ADAPTAÇÃO DO LOGIN (API + BANCO DE DADOS) ----
  formLogin.addEventListener('submit', async function (e) {
    e.preventDefault();
    setError('loginEmailError', '');
    setError('loginSenhaError', '');

    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    const senha = document.getElementById('loginSenha').value;
    const status = document.getElementById('loginStatus');
    const submitBtn = formLogin.querySelector('.submit');

    status.textContent = '';
    status.className = 'status';

    let ok = true;
    if (!isValidEmail(email)) {
      setError('loginEmailError', 'Digite um e-mail válido.');
      ok = false;
    }
    if (!senha) {
      setError('loginSenhaError', 'Digite sua senha.');
      ok = false;
    }
    if (!ok) return;

    submitBtn.disabled = true;
    status.textContent = 'Autenticando...';

    try {
      // Requisição POST para o endpoint de login da sua API
      const resposta = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha })
      });

      const resultado = await resposta.json().catch(() => ({}));

      if (!resposta.ok) {
        throw new Error(resultado.error || resultado.message || "E-mail ou senha incorretos.");
      }

      status.textContent = `Login realizado! Bem-vindo(a) de volta, ${resultado.cliente?.nome ? resultado.cliente.nome.split(' ')[0] : ''}.`;
      status.className = 'status ok';

      // Salva dados de sessão no navegador (opcional)
      if (resultado.token) localStorage.setItem('token', resultado.token);

    } catch (error) {
      status.textContent = error.message;
      status.className = 'status err';
    } finally {
      submitBtn.disabled = false;
    }
  });

  // ---- 2. ADAPTAÇÃO DO CADASTRO (API + BANCO DE DADOS) ----
  formCadastro.addEventListener('submit', async function (e) {
    e.preventDefault();
    ['cadNomeError', 'cadEmailError', 'cadTelefoneError', 'cadSenhaError'].forEach(id => setError(id, ''));

    const nome = document.getElementById('cadNome').value.trim();
    const email = document.getElementById('cadEmail').value.trim().toLowerCase();
    const celular = document.getElementById('cadTelefone').value.trim(); // campo 'cadTelefone' do HTML enviado como 'celular'
    const senha = document.getElementById('cadSenha').value;
    const status = document.getElementById('cadStatus');
    const submitBtn = formCadastro.querySelector('.submit');

    status.textContent = '';
    status.className = 'status';

    let ok = true;
    if (nome.length < 2) {
      setError('cadNomeError', 'Digite seu nome completo.');
      ok = false;
    }
    if (!isValidEmail(email)) {
      setError('cadEmailError', 'Digite um e-mail válido.');
      ok = false;
    }
    if (!isValidPhone(celular)) {
      setError('cadTelefoneError', 'Digite um telefone válido.');
      ok = false;
    }
    if (senha.length < 6) {
      setError('cadSenhaError', 'A senha precisa ter ao menos 6 caracteres.');
      ok = false;
    }
    if (!ok) return;

    submitBtn.disabled = true;
    status.textContent = 'Enviando cadastro...';

    try {
      // Requisição POST para o endpoint de cadastro da sua API
      const resposta = await fetch("http://localhost:3000/cliente", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, celular, senha })
      });

      const resultado = await resposta.json().catch(() => ({}));

      if (!resposta.ok) {
        throw new Error(resultado.error || resultado.message || "Erro ao criar conta no banco de dados.");
      }

      status.textContent = 'Conta criada com sucesso! Redirecionando para o login...';
      status.className = 'status ok';
      formCadastro.reset();

      setTimeout(showLogin, 1500);

    } catch (error) {
      status.textContent = error.message;
      status.className = 'status err';
    } finally {
      submitBtn.disabled = false;
    }
  });
})();
