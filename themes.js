/* Aparência isolada: armazenamento local por usuário, sem operações no banco. */
(function () {
  'use strict';
  const allowed = ['blue', 'teal', 'amber'];
  const prefix = 'copasul-ui-theme-v1:';
  let currentUser = null;
  function userKey(user) {
    if (!user) return null;
    const id = user.id != null ? String(user.id) : String(user.usuario || '').trim().toLowerCase();
    return id ? prefix + id : null;
  }
  function apply(theme) {
    const selected = allowed.includes(theme) ? theme : 'blue';
    document.documentElement.setAttribute('data-ui-theme', selected);
    document.querySelectorAll('[data-theme-choice]').forEach(function (button) {
      const isSelected = button.getAttribute('data-theme-choice') === selected;
      button.setAttribute('aria-pressed', String(isSelected));
      button.classList.toggle('selected', isSelected);
    });
  }
  function loadForUser(user) {
    currentUser = userKey(user);
    let saved = 'blue';
    try { if (currentUser) saved = localStorage.getItem(currentUser) || 'blue'; } catch (err) { console.warn('Preferência de tema indisponível:', err); }
    apply(saved);
  }
  function choose(theme) {
    if (!allowed.includes(theme)) return;
    apply(theme);
    try { if (currentUser) localStorage.setItem(currentUser, theme); } catch (err) { console.warn('Não foi possível salvar o tema:', err); }
  }
  function resetForLogout() { currentUser = null; apply('blue'); }
  window.copasulThemes = { loadForUser: loadForUser, resetForLogout: resetForLogout };
  apply('blue');
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-theme-choice]').forEach(function (button) {
      button.addEventListener('click', function () { choose(button.getAttribute('data-theme-choice')); });
    });
  });
})();
