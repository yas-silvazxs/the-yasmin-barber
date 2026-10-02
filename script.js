(function () {
  const tabLogin = document.getElementById('tabLogin');
  const tabCadastro = document.getElementById('tabCadastro');
  const formLogin = document.getElementById('formLogin');
  const formCadastro = document.getElementById('formCadastro');
  const switchLine = document.getElementById('switchLine');
  const goCadastro = document.getElementById('goCadastro');

  if (!tabLogin || !formLogin) return; // not on login page

  function showLogin() {
    tabLogin.classList.add('active');
    tabCadastro.classList.remove('active');
    formLogin.classList.remove('hidden');
    formCadastro.classList.add('hidden');
    switchLine.innerHTML = 'Ainda não tem conta? <button class="link-btn" id="goCadastro" type="button">Cadastre-se</button>';
    document.getElementById('goCadastro').addEventListener('click', showCadastro);
  }
  function showCadastro() {
    tabCadastro.classList.add('active');
    tabLogin.classList.remove('active');
    formCadastro.classList.remove('hidden');
    formLogin.classList.add('hidden');
    switchLine.innerHTML = 'Já tem conta? <button class="link-btn" id="goLogin" type="button">Entrar</button>';
    document.getElementById('goLogin').addEventListener('click', showLogin);
  }

  tabLogin.addEventListener('click', showLogin);
  tabCadastro.addEventListener('click', showCadastro);
  if (goCadastro) goCadastro.addEventListener('click', showCadastro);

  // ---- storage helpers (demo only) ----
  function loadUsers() {
    try {
      const raw = localStorage.getItem('yasminBarberUsers');
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }
  function saveUsers(users) {
    try { localStorage.setItem('yasminBarberUsers', JSON.stringify(users)); }
    catch (e) { /* storage indisponível */ }
  }

  function setError(id, msg) { const el = document.getElementById(id); if (el) el.textContent = msg || ''; }
  function isValidEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
  function isValidPhone(v) { return v.replace(/\D/g, '').length >= 10; }

  // ---- LOGIN ----
  formLogin.addEventListener('submit', function (e) {
    e.preventDefault();
    setError('loginEmailError', ''); setError('loginSenhaError', '');
    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    const senha = document.getElementById('loginSenha').value;
    const status = document.getElementById('loginStatus');
    status.textContent = ''; status.className = 'status';

    let ok = true;
    if (!isValidEmail(email)) { setError('loginEmailError', 'Digite um e-mail válido.'); ok = false; }
    if (!senha) { setError('loginSenhaError', 'Digite sua senha.'); ok = false; }
    if (!ok) return;

    const users = loadUsers();
    const user = users.find(u => u.email === email);
    if (!user) {
      status.textContent = 'Não encontramos essa conta. Que tal criar uma?';
      status.className = 'status err';
      return;
    }
    if (user.senha !== senha) {
      status.textContent = 'Senha incorreta. Tente novamente.';
      status.className = 'status err';
      return;
    }
    status.textContent = 'Login realizado! Bem-vindo(a) de volta, ' + user.nome.split(' ')[0] + '.';
    status.className = 'status ok';
  });

  // ---- CADASTRO ----
  formCadastro.addEventListener('submit', function (e) {
    e.preventDefault();
    ['cadNomeError', 'cadEmailError', 'cadTelefoneError', 'cadSenhaError'].forEach(id => setError(id, ''));
    const nome = document.getElementById('cadNome').value.trim();
    const email = document.getElementById('cadEmail').value.trim().toLowerCase();
    const telefone = document.getElementById('cadTelefone').value.trim();
    const senha = document.getElementById('cadSenha').value;
    const status = document.getElementById('cadStatus');
    status.textContent = ''; status.className = 'status';

    let ok = true;
    if (nome.length < 2) { setError('cadNomeError', 'Digite seu nome completo.'); ok = false; }
    if (!isValidEmail(email)) { setError('cadEmailError', 'Digite um e-mail válido.'); ok = false; }
    if (!isValidPhone(telefone)) { setError('cadTelefoneError', 'Digite um telefone válido.'); ok = false; }
    if (senha.length < 6) { setError('cadSenhaError', 'A senha precisa ter ao menos 6 caracteres.'); ok = false; }
    if (!ok) return;

    const users = loadUsers();
    if (users.some(u => u.email === email)) {
      status.textContent = 'Já existe uma conta com esse e-mail. Faça login.';
      status.className = 'status err';
      return;
    }
    users.push({ nome, email, telefone, senha });
    saveUsers(users);
    status.textContent = 'Conta criada! Já pode entrar com seu e-mail e senha.';
    status.className = 'status ok';
    formCadastro.reset();
    setTimeout(showLogin, 1200);
  });
})();
