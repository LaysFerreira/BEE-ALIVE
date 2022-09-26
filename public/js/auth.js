function isAuthenticated() {
  if (!getToken()) {
    window.location.href = '/meliponicultor/signin.html';
  } else {
    return true;
  }
}
  
function getToken() {
  return localStorage.getItem('@foodApp:token');
}

function signin(token) {
  localStorage.setItem('@foodApp:token', token);

  window.location.href = '/meliponario/cadastro.html';
}

function signout() {
  localStorage.removeItem('@foodApp:token');

  window.location.href = '/meliponicultor/signin.html';
}

export default { isAuthenticated, getToken, signin, signout };